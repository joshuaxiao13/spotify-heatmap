interface HoverPopupProps {
  textList: string[];
}
const HoverPopup = ({ textList }: HoverPopupProps) => {
  return (
    <>
      <div className="absolute ml-3 mt-3">
        <ul className=" bg-black text-gray-200 p-2 text-xs rounded-sm shadow-xl">
          {textList.map((text) => (
            <li>{text}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default HoverPopup;
