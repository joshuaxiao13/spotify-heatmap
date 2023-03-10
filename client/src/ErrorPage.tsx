import Header from './components/Header';

const ErrorPage = (props: any) => {
  const { error } = props;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex justify-center items-center flex-grow dark:bg-black">
        <p className="m-auto w-fit h-fit text-2xl dark:text-gray-300">Sorry, an unexpected error has occurred 😕</p>
      </div>
    </div>
  );
};

export default ErrorPage;
