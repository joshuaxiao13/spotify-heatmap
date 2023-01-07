import logo from '../assets/heatmap_logo.png';

const Header = () => {
  return (
    <header id="header" className="sticky top-0 z-10 w-full h-20 bg-slate-800 flex">
      <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
        <img id="profile-image" className="w-8 h-8" src={logo}></img>
        <div id="name" className="mx-7 my-auto text-white">
          Spotify Heatmap
        </div>
      </div>
    </header>
  );
};

export default Header;
