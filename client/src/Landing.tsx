import landing_page_site_example from './images/landing_page_site_example.png'

const Landing = () => {
  return (
    <div className='bg-gradient-to-r from-black to-gray-900 w-screen h-screen'>
      <div className="h-1/4 w-full">
        <h1 className='text-7xl text-white mx-auto w-fit pt-10'>Spotify Heatmap</h1>
        <div className='w-fit mx-auto my-10'>
          <a className="p-2 h-10 bg-gray-700 text-white text-lg rounded-md" href="/login">
            Login With Spotify
          </a>
        </div>
      </div>
      <div className="h-3/4">
        <img className="w-2/3 my-auto mx-auto rounded-md shadow-xl" src={landing_page_site_example}></img>
      </div>
    </div>
  );
}

export default Landing;
