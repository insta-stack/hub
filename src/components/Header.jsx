import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiBookmark, FiStar, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Header = () => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Library state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [savedGames, setSavedGames] = useState([]);
  
  // Game details modal state
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  
  // API key from environment variable
  const API_KEY = import.meta.env.VITE_RAWG_API_KEY;

  // Load saved games from localStorage
  useEffect(() => {
    const loadedGames = JSON.parse(localStorage.getItem('savedGames')) || [];
    setSavedGames(loadedGames);
  }, []);

  // Save games to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedGames', JSON.stringify(savedGames));
  }, [savedGames]);

  // Search games function with debounce
  useEffect(() => {
    const searchGames = async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_RAWG_API_KEY ? `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=5` : ''}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => searchGames(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch game details and screenshots
  const fetchGameDetails = async (gameId) => {
    try {
      // Fetch game details
      const detailsResponse = await fetch(
        `${import.meta.env.VITE_RAWG_API_KEY ? `https://api.rawg.io/api/games/${gameId}?key=${API_KEY}` : ''}`
      );
      const detailsData = await detailsResponse.json();
      setGameDetails(detailsData);

      // Fetch screenshots
      const screenshotsResponse = await fetch(
        `${import.meta.env.VITE_RAWG_API_KEY ? `https://api.rawg.io/api/games/${gameId}/screenshots?key=${API_KEY}` : ''}`
      );
      const screenshotsData = await screenshotsResponse.json();
      setScreenshots(screenshotsData.results || []);
      setCurrentScreenshotIndex(0);
    } catch (error) {
      console.error('Error fetching game details:', error);
    }
  };

  // Toggle game in library
  const toggleSaveGame = (game) => {
    setSavedGames(prev => 
      prev.some(g => g.id === game.id)
        ? prev.filter(g => g.id !== game.id)
        : [...prev, game]
    );
  };

  // Open game details modal
  const openGameModal = (game) => {
    setSelectedGame(game);
    fetchGameDetails(game.id);
  };

  // Close game details modal
  const closeGameModal = () => {
    setSelectedGame(null);
    setGameDetails(null);
    setScreenshots([]);
  };

  // Navigate screenshots
  const nextScreenshot = () => {
    setCurrentScreenshotIndex(prev => 
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  };

  const prevScreenshot = () => {
    setCurrentScreenshotIndex(prev => 
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <img 
                src=" https://img.freepik.com/premium-photo/blue-logo-video-game-called-video-game-series_1264538-9846.jpg?w=360" 
                alt="GameHub Logo" 
                className="h-10 w- cursor-zoom-out"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150x40?text=GameHub';
                  e.target.className = 'h-8 w-auto bg-gray-800 p-1 rounded';
                }}
              />
            </div>
            
            {/* Library button */}
            <button 
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              className={`flex items-center bg-purple-700 px-3 py-1 rounded-lg transition-colors ${isLibraryOpen ? 'bg-red-700' : 'hover:bg-yellow-800'}`}
            >
              <FiBookmark className="mr-2" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search games..."
                className="w-full pl-10 pr-10 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="text-gray-400 hover:text-white" />
                </button>
              )}
              
              {/* Search results dropdown */}
              {searchQuery && (
                <div className="absolute mt-1 w-full bg-gray-800 rounded-lg shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map(game => (
                        <div 
                          key={game.id}
                          className="p-3 hover:bg-gray-700 cursor-pointer flex items-center"
                          onClick={() => openGameModal(game)}
                        >
                          <img 
                            src={game.background_image || 'https://via.placeholder.com/150'} 
                            alt={game.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{game.name}</p>
                            <p className="text-gray-400 text-sm">
                              {game.released?.substring(0, 4) || 'N/A'} • ⭐ {game.rating?.toFixed(1) || 'N/A'}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveGame(game);
                            }}
                            className={`p-1 rounded-full ${savedGames.some(g => g.id === game.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                          >
                            <FiStar />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-gray-400">
                      No games found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section - Auth */}
          <div className="flex items-center">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                    userButtonTrigger: "focus:ring-0 focus:outline-none"
                  }
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                  <FiUser className="mr-2" />
                  <span className="hidden sm:inline">JOIN-US</span>
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Library sidebar */}
      <div className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 ease-in-out ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'} z-40 overflow-y-auto`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your Library</h2>
            <button 
              onClick={() => setIsLibraryOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {savedGames.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiBookmark size={32} className="mx-auto mb-2" />
              <p>Your library is empty</p>
              <p className="text-sm mt-1">Save games to access them later</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedGames.map(game => (
                <div 
                  key={game.id} 
                  className="flex items-center bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer"
                  onClick={() => openGameModal(game)}
                >
                  <img 
                    src={game.background_image || 'https://via.placeholder.com/150'} 
                    alt={game.name}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{game.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {game.released?.substring(0, 4) || 'N/A'} • ⭐ {game.rating?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveGame(game);
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Game details modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{selectedGame.name}</h2>
              <button 
                onClick={closeGameModal}
                className="text-gray-400 hover:text-white p-1"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6">
              {/* Screenshots carousel */}
              {screenshots.length > 0 && (
                <div className="relative mb-6">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={screenshots[currentScreenshotIndex]?.image}
                      alt={`Screenshot ${currentScreenshotIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {screenshots.length > 1 && (
                    <>
                      <button
                        onClick={prevScreenshot}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextScreenshot}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <FiChevronRight size={20} />
                      </button>
                      <div className="flex justify-center mt-2 space-x-1">
                        {screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentScreenshotIndex(index)}
                            className={`w-2 h-2 rounded-full ${currentScreenshotIndex === index ? 'bg-white' : 'bg-gray-500'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Game details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300">
                      {gameDetails?.description_raw || 'No description available.'}
                    </p>
                  </div>

                  {/* System Requirements */}
                  {gameDetails?.platforms?.some(p => p.requirements) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">System Requirements</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {gameDetails.platforms.filter(p => p.requirements).map(platform => (
                          <div key={platform.platform.id} className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">{platform.platform.name}</h4>
                            {platform.requirements.minimum && (
                              <div className="mb-3">
                                <h5 className="text-sm text-gray-400 mb-1">Minimum:</h5>
                                <p className="text-sm text-gray-300 whitespace-pre-line">
                                  {platform.requirements.minimum}
                                </p>
                              </div>
                            )}
                            {platform.requirements.recommended && (
                              <div>
                                <h5 className="text-sm text-gray-400 mb-1">Recommended:</h5>
                                <p className="text-sm text-gray-300 whitespace-pre-line">
                                  {platform.requirements.recommended}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {/* Game info */}
                  <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Game Info</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Release Date</p>
                        <p className="text-white">{formatDate(gameDetails?.released)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <div className="flex items-center">
                          <FiStar className="text-yellow-400 mr-1" />
                          <span className="text-white">{gameDetails?.rating?.toFixed(1) || 'N/A'}/5</span>
                        </div>
                      </div>
                      {gameDetails?.metacritic && (
                        <div>
                          <p className="text-sm text-gray-400">Metacritic</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded ${
                            gameDetails.metacritic >= 75 ? 'bg-green-900/50 text-green-400' :
                            gameDetails.metacritic >= 50 ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {gameDetails.metacritic}
                          </div>
                        </div>
                      )}
                      {gameDetails?.genres?.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400">Genres</p>
                          <div className="flex flex-wrap gap-1">
                            {gameDetails.genres.map(genre => (
                              <span key={genre.id} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-white">
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {gameDetails?.platforms?.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400">Platforms</p>
                          <div className="flex flex-wrap gap-1">
                            {gameDetails.platforms.map(platform => (
                              <span key={platform.platform.id} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-white">
                                {platform.platform.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  {gameDetails?.stores?.length > 0 && (
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Where to Buy</h3>
                      <div className="space-y-2">
                        {gameDetails.stores.map(store => (
                          <a
                            key={store.id}
                            href={`https://${store.store.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                          >
                            <p className="text-white font-medium">{store.store.name}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add to library button */}
                  <button
                    onClick={() => toggleSaveGame(selectedGame)}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-lg ${
                      savedGames.some(g => g.id === selectedGame.id)
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white transition-colors`}
                  >
                    <FiBookmark className="mr-2" />
                    {savedGames.some(g => g.id === selectedGame.id)
                      ? 'Remove from Library'
                      : 'Add to Library'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when library is open */}
      {isLibraryOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsLibraryOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;