import './Modal.css';

interface ModalProps {
  show: boolean;
  onClose: any;
  title: string;
  content: string;
}

const Modal = (props: ModalProps) => {
  const { show, onClose, title, content } = props;
  if (!show) return <></>;
  console.log('SHOWING');
  return (
    <div
      id="modal"
      className="fixed left-0 top-0 right-0 bottom-0 bg-modal flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div id="modal-content" className="w-[500px] bg-white" onClick={(e) => e.stopPropagation()}>
        <div id="modal-header" className="p-[10px]">
          <h4 id="modal-title" className="m-0">
            {title}
          </h4>
        </div>
        <div id="modal-body" className="p-[10px] border-t border-b  border-solid border-white">
          {content}
        </div>
        <div id="modal-footer" className="p-[10px]">
          <button className="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
