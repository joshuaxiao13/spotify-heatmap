import logo from '../assets/heatmap_logo.png';

interface HeaderProps {
  deleteUserHandler?: () => void;
  showModal?: () => void;
}
const Header = (props: HeaderProps) => {
  const { deleteUserHandler, showModal } = props;
  return (
    <div id="header" className="sticky top-0 z-10 w-full h-20 bg-slate-700 flex">
      <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
        <a href="./">
          <img id="profile-image" className="w-8 h-8" src={logo}></img>
        </a>
        <div id="name" className="mx-7 my-auto text-white">
          <>
            <a href="./">Spotify Heatmap</a>{' '}
          </>
        </div>
      </div>
      {deleteUserHandler && (
        <>
          <div className="w-fit h-fit ml-auto my-auto mr-10 p-1 rounded-lg bg-red-400 border-[1px] border-red-500">
            <button className="text-sm" onClick={showModal}>
              Delete User Data
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;

// && (
//     <div className="w-fit h-fit bg-black text-white p-2 fixed mt-2 rounded-sm text-xs">
//       "Delete User Data" removes data stored on our database for your account. This data allows Spotify
//       Heatmap to view your play history since registration with this site (and render those green squares
//       below). You can remove app access by going to https://www.spotify.com/us/account/apps/ or deny access
//       from the spotify app authorization page.
//     </div>
//   )}
