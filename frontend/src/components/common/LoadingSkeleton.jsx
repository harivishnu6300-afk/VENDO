import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
    <div className="skeleton" style={{ width: '100%', paddingTop: '80%' }} />
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div className="skeleton" style={{ width: '40%', height: '14px' }} />
      <div className="skeleton" style={{ width: '90%', height: '18px' }} />
      <div className="skeleton" style={{ width: '60%', height: '14px' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ width: '40%', height: '24px' }} />
        <div className="skeleton" style={{ width: '30%', height: '24px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '36px', marginTop: '0.5rem' }} />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem'
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '16px', width: `${60 + (i * 10) % 30}%` }} />
      </td>
    ))}
  </tr>
);
