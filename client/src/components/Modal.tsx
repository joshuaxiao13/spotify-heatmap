interface ModalProps {
  show: boolean;
  onClose: any;
  title: string;
  content: JSX.Element;
  buttonText: string;
  onClickHandler: () => void;
}

const Modal = (props: ModalProps) => {
  const { show, onClose, title, content, buttonText, onClickHandler } = props;
  if (!show) return <></>;
  return (
    <div
      id="modal"
      className="fixed left-0 top-0 right-0 bottom-0 bg-modal flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        id="modal-content"
        className="w-[500px] bg-white rounded-md shadow-2xl space dark:bg-neutral-800 dark:text-white dark:focus:shadow-darkGray p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="modal-header" className="p-[10px]">
          <h4 id="modal-title" className="m-0 font-bold">
            {title}
          </h4>
        </div>
        <div
          id="modal-body"
          className="p-[10px] border-t border-b  border-solid border-white text-sm dark:border-neutral-800"
        >
          {content}
        </div>
        <div id="modal-footer" className="p-[10px]">
          <div className="space-x-3">
            <button onClick={onClickHandler} className="w-fit py-1 px-2 bg-green-700 text-white rounded-md text-sm">
              {buttonText}
            </button>
            <button className="w-fit py-1 px-2 bg-red-700 rounded-md text-sm text-white" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
