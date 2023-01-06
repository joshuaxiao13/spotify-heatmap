const Header = () => {
  return (
    <header id="header" className="sticky top-0 w-full h-20 bg-slate-800 flex" style={{ color: 'white' }}>
      <div id="logoAndName" className="h-fit w-fit my-auto mx-7 flex">
        <img
          id="profile-image"
          className="w-8 h-8"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
        />
        <div id="name" className="mx-7 my-auto">
          Spotify Heatmap
        </div>
      </div>
    </header>
  );
};

export default Header;
