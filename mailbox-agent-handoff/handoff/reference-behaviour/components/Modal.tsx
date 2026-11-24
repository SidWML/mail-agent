'use client';
import React from 'react';
export function Modal({ title, children, onClose, actions }: { title: string; children: React.ReactNode; onClose: () => void; actions?: React.ReactNode }) {
  return (
    <div className="modalbg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <div className="act"><button className="btn" onClick={onClose}>Cancel</button>{actions}</div>
      </div>
    </div>
  );
}
