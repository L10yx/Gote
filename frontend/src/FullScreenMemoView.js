import React from 'react';
import './FullScreenMemoView.css'; // Import the CSS file

function FullScreenMemoView({ memo, onClose }) {
  if (!memo) return null;

  return (
    <div className="full-screen-memo-view">
      <div className="full-screen-content">
        <h2>{memo.Title}</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{memo.Content}</p>
      </div>
      <button onClick={onClose} className="close-button">Close</button>
    </div>
  );
}

export default FullScreenMemoView;