// ModalComponent.js
import React from 'react';

const ModalComponent = ({ data, onClose, userId, socket}) => {
  if (!data) return null;
  console.log('Modal userId:', userId);

  const handleOkClick = () => {
    socket.emit('userClickedOk', userId);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{data.message}</p>
        <button onClick={handleOkClick}>OK</button>
      </div>
    </div>
  );
};

export default ModalComponent;
