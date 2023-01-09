import './Modal.css';

interface ModalProps {
  show: boolean;
  onClose: any;
  title: string;
  content: string;
}

const Modal = (props: ModalProps) => {
  const { show, onClose, title, content } = props;
  return (
    <div className={`modal ${show ? 'show' : ''} z-50`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
        </div>
      </div>
      <div className="modal-body">{content}</div>
      <div className="modal-footer">
        <button className="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
