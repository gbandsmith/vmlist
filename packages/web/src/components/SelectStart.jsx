const SelectStart = ({ disabled, handleStart }) => {
  return disabled ? (
    <button
      disabled
      className="py-2 w-56 text-white text-lg bg-yellow-300 border-0 rounded cursor-default"
    >
      Can&apos;t start now...
    </button>
  ) : (
    <button
      onClick={handleStart}
      className="py-2 w-56 text-white text-lg bg-yellow-500 hover:bg-yellow-600 border-0 rounded focus:outline-none"
    >
      Start it!
    </button>
  );
};

export default SelectStart;
