import { FiSearch, FiBell, FiMessageSquare } from 'react-icons/fi';

const Navbar = ({ userType = 'client' }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">SkillSwap</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <button className="p-2 text-gray-600 hover:text-indigo-600 relative">
            <FiBell size={20} />
          </button>
          
          <button className="p-2 text-gray-600 hover:text-indigo-600 relative">
            <FiMessageSquare size={20} />
          </button>

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
              {userType === 'client' ? 'C' : 'F'}
            </div>
            <span className="font-medium">
              {userType === 'client' ? 'Client' : 'Freelancer'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;