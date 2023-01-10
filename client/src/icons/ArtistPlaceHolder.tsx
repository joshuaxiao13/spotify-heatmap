interface ArtistPlaceHolderProps {
  id: string;
}
export const ArtistPlaceHolder = ({ id }: ArtistPlaceHolderProps) => {
  return (
    <svg
      id={id}
      className="w-10 h-10 text-gray-400 -left-1 bg-slate-200 rounded-full"
      fill="currentColor"
      viewBox="0 0 20 15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
    </svg>
  );
};
