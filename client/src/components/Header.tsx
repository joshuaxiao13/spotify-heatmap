import SpotifyUser from 'spotify-api/spotifyUser';
import logo from '../assets/heatmap_logo.png';

const handlePress = (e: any, user: any) => {
  e.preventDefault();
  // user.deleteUser()
};

interface HeaderProps {
  user?: React.MutableRefObject<SpotifyUser | null>;
}
const Header = (props: HeaderProps) => {
  const { user } = props;
  return (
    <div id="header" className="sticky top-0 z-10 w-full h-20 bg-slate-800 flex">
      <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
        <img id="profile-image" className="w-8 h-8" src={logo}></img>
        <div id="name" className="mx-7 my-auto text-white">
          Spotify Heatmap
        </div>
      </div>
      {user?.current && (
        <div className="w-fit h-fit ml-auto my-auto mr-10 p-1 rounded-lg bg-red-400 border-[1px] border-red-600">
          <button type="submit" className="text-sm" onClick={(e) => handlePress(e, user)}>
            Delete User Data
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
