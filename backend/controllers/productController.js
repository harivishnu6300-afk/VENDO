const pool = require("../config/db");

// ============================================================
// HELPER: Generate slug
// ============================================================
const generateSlug = (name) => {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      category_id,
      brand,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20,
      featured,
      trending,
      deal,
    } = req.query;

    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const offset = (safePage - 1) * safeLimit;

    let whereConditions = ["p.status = 'active'"];
    let queryParams = [];

    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------
    if (search) {
      whereConditions.push(`
        (
          p.name LIKE ?
          OR p.brand LIKE ?
          OR p.description LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      queryParams.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    // --------------------------------------------------------
    // Category
    // --------------------------------------------------------
    if (category_id) {
      whereConditions.push("p.category_id = ?");
      queryParams.push(category_id);
    } else if (category) {
      whereConditions.push(`
        (
          c.slug = ?
          OR c.name = ?
        )
      `);

      queryParams.push(category, category);
    }

    // --------------------------------------------------------
    // Brand
    // --------------------------------------------------------
    if (brand) {
      const brands = String(brand)
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      if (brands.length > 0) {
        whereConditions.push(
          `p.brand IN (${brands.map(() => "?").join(",")})`
        );

        queryParams.push(...brands);
      }
    }

    // --------------------------------------------------------
    // Price range
    // --------------------------------------------------------
    if (minPrice !== undefined && minPrice !== "") {
      whereConditions.push("p.price >= ?");
      queryParams.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      whereConditions.push("p.price <= ?");
      queryParams.push(Number(maxPrice));
    }

    // --------------------------------------------------------
    // Featured
    // --------------------------------------------------------
    if (featured === "true" || featured === "1") {
      whereConditions.push("p.is_featured = 1");
    }

    // --------------------------------------------------------
    // Trending
    // --------------------------------------------------------
    if (trending === "true" || trending === "1") {
      whereConditions.push("p.is_trending = 1");
    }

    // --------------------------------------------------------
    // Deals
    // --------------------------------------------------------
    if (deal === "true" || deal === "1") {
      whereConditions.push("p.is_deal = 1");
    }

    const whereClause = whereConditions.join(" AND ");

    // --------------------------------------------------------
    // Sorting
    // --------------------------------------------------------
    let orderBy = "p.created_at DESC";

    switch (sort) {
      case "price_low":
        orderBy = "p.price ASC";
        break;

      case "price_high":
        orderBy = "p.price DESC";
        break;

      case "name_asc":
        orderBy = "p.name ASC";
        break;

      case "name_desc":
        orderBy = "p.name DESC";
        break;

      case "rating":
        orderBy = "p.rating DESC";
        break;

      case "popular":
        orderBy = "p.sold_count DESC";
        break;

      case "newest":
        orderBy = "p.created_at DESC";
        break;

      default:
        orderBy = "p.created_at DESC";
    }

    // --------------------------------------------------------
    // Products
    // --------------------------------------------------------
    const [products] = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,

        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS primary_image

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE ${whereClause}

      ORDER BY ${orderBy}

      LIMIT ? OFFSET ?
      `,
      [...queryParams, safeLimit, offset]
    );

    // --------------------------------------------------------
    // Total count
    // --------------------------------------------------------
    const [countResult] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE ${whereClause}
      `,
      queryParams
    );

    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }
};

// ============================================================
// GET FILTER META
// ============================================================
const getFilterMeta = async (req, res, next) => {
  try {
    const [brands] = await pool.query(`
      SELECT DISTINCT brand
      FROM products
      WHERE status = 'active'
        AND brand IS NOT NULL
        AND brand <> ''
      ORDER BY brand ASC
    `);

    const [priceResult] = await pool.query(`
      SELECT
        MIN(price) AS minPrice,
        MAX(price) AS maxPrice
      FROM products
      WHERE status = 'active'
    `);

    const [categories] = await pool.query(`
      SELECT
        id,
        name,
        slug
      FROM categories
      WHERE status = 'active'
      ORDER BY name ASC
    `);

    return res.status(200).json({
      success: true,
      data: {
        brands: brands.map((item) => item.brand),
        priceRange: {
          min: priceResult[0]?.minPrice || 0,
          max: priceResult[0]?.maxPrice || 0,
        },
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching filter metadata:", error);
    next(error);
  }
};

// ============================================================
// GET SINGLE PRODUCT
// ============================================================
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const product = products[0];

    // --------------------------------------------------------
    // Product images
    // --------------------------------------------------------
    const [images] = await pool.query(
      `
      SELECT *
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, sort_order ASC, id ASC
      `,
      [id]
    );

    // --------------------------------------------------------
    // Reviews summary
    // --------------------------------------------------------
    let reviewSummary = {
      averageRating: Number(product.rating || 0),
      reviewCount: Number(product.review_count || 0),
    };

    try {
      const [reviewResult] = await pool.query(
        `
        SELECT
          COALESCE(AVG(rating), 0) AS averageRating,
          COUNT(*) AS reviewCount
        FROM reviews
        WHERE product_id = ?
          AND status = 'approved'
        `,
        [id]
      );

      if (reviewResult.length > 0) {
        reviewSummary = {
          averageRating: Number(
            reviewResult[0].averageRating || 0
          ),
          reviewCount: Number(
            reviewResult[0].reviewCount || 0
          ),
        };
      }
    } catch (reviewError) {
      console.warn(
        "Could not load review summary:",
        reviewError.message
      );
    }

    // --------------------------------------------------------
    // Safely parse specifications
    // --------------------------------------------------------
    let specifications = {};

    try {
      if (product.specifications) {
        if (typeof product.specifications === "string") {
          specifications = JSON.parse(product.specifications);
        } else {
          specifications = product.specifications;
        }
      }
    } catch (error) {
      specifications = {};
    }

    product.specifications = specifications;
    product.images = images;
    product.primary_image =
      images.find((image) => image.is_primary)?.image_url ||
      images[0]?.image_url ||
      product.image_url ||
      null;

    product.rating = reviewSummary.averageRating;
    product.review_count = reviewSummary.reviewCount;

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    next(error);
  }
};

// ============================================================
// CREATE PRODUCT
// ============================================================
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description = "",
      category_id,
      brand = "",
      price,
      original_price,
      discount = 0,
      stock = 0,
      specifications,
      image_url,
      is_featured = false,
      is_trending = false,
      is_deal = false,
      status = "active",
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------
    if (!name || String(name).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required.",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Product price is required.",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative.",
      });
    }

    // --------------------------------------------------------
    // Safe specifications JSON
    // --------------------------------------------------------
    let safeSpecifications = "{}";

    if (specifications !== undefined && specifications !== null) {
      try {
        if (typeof specifications === "string") {
          JSON.parse(specifications);
          safeSpecifications = specifications;
        } else {
          safeSpecifications = JSON.stringify(specifications);
        }
      } catch (error) {
        safeSpecifications = "{}";
      }
    }

    // --------------------------------------------------------
    // Generate unique slug
    // --------------------------------------------------------
    let slug = generateSlug(name);

    const [existingSlug] = await pool.query(
      `
      SELECT id
      FROM products
      WHERE slug = ?
      LIMIT 1
      `,
      [slug]
    );

    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // --------------------------------------------------------
    // Insert product
    // --------------------------------------------------------
    const [result] = await pool.query(
      `
      INSERT INTO products (
        name,
        slug,
        description,
        category_id,
        brand,
        price,
        original_price,
        discount,
        stock,
        specifications,
        image_url,
        is_featured,
        is_trending,
        is_deal,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(name).trim(),
        slug,
        description,
        category_id || null,
        brand,
        Number(price),
        original_price || null,
        Number(discount) || 0,
        Number(stock) || 0,
        safeSpecifications,
        image_url || null,
        Boolean(is_featured),
        Boolean(is_trending),
        Boolean(is_deal),
        status,
      ]
    );

    // --------------------------------------------------------
    // Add primary image if provided
    // --------------------------------------------------------
    if (image_url && result.insertId) {
      try {
        await pool.query(
          `
          INSERT INTO product_images (
            product_id,
            image_url,
            is_primary,
            sort_order
          )
          VALUES (?, ?, 1, 0)
          `,
          [result.insertId, image_url]
        );
      } catch (imageError) {
        console.warn(
          "Could not insert product image:",
          imageError.message
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    next(error);
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      category_id,
      brand,
      price,
      original_price,
      discount,
      stock,
      specifications,
      image_url,
      is_featured,
      is_trending,
      is_deal,
      status,
    } = req.body;

    // --------------------------------------------------------
    // Get existing product
    // --------------------------------------------------------
    const [existingProducts] = await pool.query(
      `
      SELECT *
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const current = existingProducts[0];

    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------
    if (
      price !== undefined &&
      price !== null &&
      price !== "" &&
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    if (
      stock !== undefined &&
      stock !== null &&
      stock !== "" &&
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative.",
      });
    }

    // ========================================================
    // IMPORTANT:
    // Safely preserve specifications.
    // This fixes:
    //
    // Invalid JSON text: "Invalid value."
    // at position 1 in products.specifications
    //
    // because JS objects must be JSON.stringify()'d
    // before sending them to MySQL JSON column.
    // ========================================================
    let safeSpecifications = "{}";

    if (specifications !== undefined && specifications !== null) {
      try {
        if (typeof specifications === "string") {
          const parsed = JSON.parse(specifications);
          safeSpecifications = JSON.stringify(parsed);
        } else {
          safeSpecifications = JSON.stringify(specifications);
        }
      } catch (error) {
        console.warn(
          "Invalid specifications received. Using existing specifications."
        );

        try {
          if (typeof current.specifications === "string") {
            JSON.parse(current.specifications);
            safeSpecifications = current.specifications;
          } else if (current.specifications) {
            safeSpecifications = JSON.stringify(
              current.specifications
            );
          } else {
            safeSpecifications = "{}";
          }
        } catch (fallbackError) {
          safeSpecifications = "{}";
        }
      }
    } else {
      try {
        if (typeof current.specifications === "string") {
          JSON.parse(current.specifications);
          safeSpecifications = current.specifications;
        } else if (current.specifications) {
          safeSpecifications = JSON.stringify(
            current.specifications
          );
        } else {
          safeSpecifications = "{}";
        }
      } catch (error) {
        safeSpecifications = "{}";
      }
    }

    // --------------------------------------------------------
    // Update product
    // --------------------------------------------------------
    await pool.query(
      `
      UPDATE products
      SET
        name = ?,
        description = ?,
        category_id = ?,
        brand = ?,
        price = ?,
        original_price = ?,
        discount = ?,
        stock = ?,
        specifications = ?,
        is_featured = ?,
        is_trending = ?,
        is_deal = ?,
        status = ?
      WHERE id = ?
      `,
      [
        name !== undefined ? name : current.name,

        description !== undefined
          ? description
          : current.description,

        category_id !== undefined
          ? category_id
          : current.category_id,

        brand !== undefined
          ? brand
          : current.brand,

        price !== undefined
          ? Number(price)
          : current.price,

        original_price !== undefined
          ? original_price
          : current.original_price,

        discount !== undefined
          ? Number(discount) || 0
          : current.discount,

        stock !== undefined
          ? Number(stock)
          : current.stock,

        safeSpecifications,

        is_featured !== undefined
          ? Boolean(is_featured)
          : Boolean(current.is_featured),

        is_trending !== undefined
          ? Boolean(is_trending)
          : Boolean(current.is_trending),

        is_deal !== undefined
          ? Boolean(is_deal)
          : Boolean(current.is_deal),

        status !== undefined
          ? status
          : current.status,

        id,
      ]
    );

    // --------------------------------------------------------
    // Update image
    // --------------------------------------------------------
    if (image_url !== undefined) {
      try {
        const [existingImages] = await pool.query(
          `
          SELECT id
          FROM product_images
          WHERE product_id = ?
          ORDER BY is_primary DESC, sort_order ASC, id ASC
          LIMIT 1
          `,
          [id]
        );

        if (existingImages.length > 0) {
          await pool.query(
            `
            UPDATE product_images
            SET image_url = ?
            WHERE id = ?
            `,
            [image_url, existingImages[0].id]
          );
        } else if (image_url) {
          await pool.query(
            `
            INSERT INTO product_images (
              product_id,
              image_url,
              is_primary,
              sort_order
            )
            VALUES (?, ?, 1, 0)
            `,
            [id, image_url]
          );
        }
      } catch (imageError) {
        console.warn(
          "Could not update product image:",
          imageError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    next(error);
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Check product exists
    // --------------------------------------------------------
    const [products] = await pool.query(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // --------------------------------------------------------
    // Delete product
    //
    // Related tables such as:
    // product_images
    // cart_items
    // wishlist_items
    // reviews
    //
    // should be handled by the foreign-key rules
    // configured in the database.
    // --------------------------------------------------------
    await pool.query(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  getProducts,
  getFilterMeta,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};