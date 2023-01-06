import logo from '../assets/heatmap_logo.png';

const Header = () => {
  return (
    <header id="header" className="sticky top-0 w-full h-20 bg-slate-800 flex" style={{ color: 'white' }}>
      <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
        <img id="profile-image" className="w-8 h-8" src={logo}></img>
        <div id="name" className="mx-7 my-auto">
          Spotify Heatmap
        </div>
      </div>
    </header>
  );
};

export default Header;
