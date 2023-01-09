interface HoverPopupProps {
  textList: string[];
}
const HoverPopup = ({ textList }: HoverPopupProps) => {
  return (
    <>
      <div className="absolute">
        <ul className=" bg-black text-white p-2 text-xs rounded-sm shadow-xl">
          {textList.map((text) => (
            <li>{text}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default HoverPopup;
