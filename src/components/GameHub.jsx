import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiBookmark, FiChevronDown, FiX, FiMenu, 
  FiStar, FiFilter, FiCalendar, FiTrendingUp, 
  FiArrowLeft, FiCheckCircle, FiXCircle,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

// Shared Header Component
const Header = () => {
  // acces it from HEADER COMPO 
};

// Main Game Hub Component
const GameHub = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<GamesList />} />
        <Route path="/game/:id" element={<GameDetailsPage />} />
      </Routes>
    </Router>
  );
};

// Game Card Component
const GameCard = ({ game }) => {
  return (
    <Link 
      to={`/game/${game.id}`}
      className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-200 block hover:shadow-lg hover:shadow-blue-500/10"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.background_image || '/placeholder-game.jpg'} 
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center">
            <FiStar className="text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-white">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-100 line-clamp-1">{game.name}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-3 h-[60px]">
          {game.description_raw || 'No description available for this game. Check back later for updates.'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {(game.genres || []).slice(0, 2).map(genre => (
            <span key={genre.id} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-200">
              {genre.name}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{game.released ? new Date(game.released).getFullYear() : 'N/A'}</span>
          <span>{game.playtime || '0'} hours</span>
        </div>
      </div>
    </Link>
  );
};

// Games List Page Component
const GamesList = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    year: '',
    popularity: ''
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const gamesPerPage = 12;

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_API_KEY}`);
        const data = await response.json();
        setGames(data.results);
        setFilteredGames(data.results);
        setTotalPages(Math.ceil(data.results.length / gamesPerPage));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
        setIsLoading(false);
      }
    };
    
    fetchGames();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...games];
    
    // Category filter (Strategy)
    if (filters.category) {
      result = result.filter(game => 
        game.genres?.some(genre => genre.name === filters.category)
      );
    }
    
    // Tag filter (Single Player)
    if (filters.tag) {
      result = result.filter(game => 
        game.tags?.some(tag => tag.name === filters.tag)
      );
    }
    
    // Year filter (2023)
    if (filters.year) {
      result = result.filter(game => {
        if (!game.released) return false;
        const releaseYear = new Date(game.released).getFullYear();
        
        switch(filters.year) {
          case '2023':
            return releaseYear === 2023;
          case '2020-2023':
            return releaseYear >= 2020 && releaseYear <= 2023;
          case '2015-2019':
            return releaseYear >= 2015 && releaseYear <= 2019;
          case 'Before 2015':
            return releaseYear < 2015;
          default:
            return true;
        }
      });
    }
    
    // Popularity sorting
    if (filters.popularity) {
      switch(filters.popularity) {
        case 'Top Rated':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'Most Played':
          result.sort((a, b) => (b.playtime || 0) - (a.playtime || 0));
          break;
        case 'New Releases':
          result.sort((a, b) => new Date(b.released || 0) - new Date(a.released || 0));
          break;
        default:
          break;
      }
    }
    
    setFilteredGames(result);
    setTotalPages(Math.ceil(result.length / gamesPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, games]);

  // Get current games for pagination
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const applyFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? '' : value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      tag: '',
      year: '',
      popularity: ''
    });
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex">
        {/* Sidebar Filters - Now Sticky */}
        <div className={`fixed inset-y-0 left-0 z-20 w-72 bg-gray-900 border-r border-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)]`}>
          <div className="p-5 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FiFilter className="mr-2" /> Filters
              </h2>
              <button 
                onClick={clearAllFilters}
                className="text-xs  text-black hover:text-blue-300  bg-purple-700"
              >
                Clear all
              </button>
            </div>
            
            {/* Categories */}
            <div className="mb-8">
              <h3 className="flex items-center text-gray-400 uppercase text-xs font-medium mb-3">
                Categories
              </h3>
              <div className="space-y-2">
                {['Action', 'Adventure', 'RPG', 'Strategy'].map(category => (
                  <button
                    key={category}
                    onClick={() => applyFilter('category', category)}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors ${filters.category === category ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-100'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Release Year */}
            <div className="mb-8">
              <h3 className="flex items-center text-gray-400 uppercase text-xs font-medium mb-3">
                <FiCalendar className="mr-2" /> Release Year
              </h3>
              <div className="space-y-2">
                {['2020-2023', '2015-2019', 'Before 2015'].map(year => (
                  <button
                    key={year}
                    onClick={() => applyFilter('year', year)}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors ${filters.year === year ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-100'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Popularity */}
            <div className="mb-8">
              <h3 className="flex items-center text-gray-400 uppercase text-xs font-medium mb-3">
                <FiTrendingUp className="mr-2" /> Sort By
              </h3>
              <div className="space-y-2">
                {['Top Rated', 'Most Played', 'New Releases'].map(popularity => (
                  <button
                    key={popularity}
                    onClick={() => applyFilter('popularity', popularity)}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors ${filters.popularity === popularity ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-100'}`}
                  >
                    {popularity}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="flex items-center text-gray-400 uppercase text-xs font-medium mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Multiplayer', 'Single Player', 'Open World', 'Story Rich'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => applyFilter('tag', tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${filters.tag === tag ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-100'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold mb-2 text-gray-100">Discover Games</h1>
              <div className="flex gap-2">
                {Object.entries(filters).map(([key, value]) => (
                  value && (
                    <span key={key} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full flex items-center">
                      {value}
                      <button 
                        onClick={() => setFilters(prev => ({...prev, [key]: ''}))}
                        className="ml-2"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  )
                ))}
              </div>
            </div>
            <p className="text-gray-400 font-medium">{filteredGames.length} games found</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2 text-gray-100">No games found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <FiChevronRight size={20} />
                  </button>
                </nav>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-20 hover:bg-blue-700 transition-colors"
      >
        {isSidebarOpen ? <FiX size={20} /> : <FiFilter size={20} />}
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-70 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

// System Requirements Component
const SystemRequirements = ({ requirements }) => {
  if (!requirements || (!requirements.minimum && !requirements.recommended)) {
    return (
      <div className="text-gray-400 text-sm">
        System requirements not available
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requirements.minimum && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-gray-300">Minimum Requirements</h4>
          <div className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: requirements.minimum }} />
        </div>
      )}
      {requirements.recommended && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-gray-300">Recommended Requirements</h4>
          <div className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: requirements.recommended }} />
        </div>
      )}
    </div>
  );
};

// Screenshots Carousel Component
const ScreenshotsCarousel = ({ screenshots }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
        No screenshots available
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
      <img 
        src={screenshots[currentIndex]?.image || '/placeholder-screenshot.jpg'} 
        alt={`Screenshot ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 flex items-center justify-between p-2">
        <button 
          onClick={goToPrevious}
          className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button 
          onClick={goToNext}
          className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
        {screenshots.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

// Game Details Page Component
const GameDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch game details
        const detailResponse = await fetch(`https://api.rawg.io/api/games/${id}?key=${import.meta.env.VITE_RAWG_API_KEY}`);
        const detailData = await detailResponse.json();
        setGameDetails(detailData);
        
        // Fetch screenshots
        const screenshotsResponse = await fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${import.meta.env.VITE_RAWG_API_KEY}`);
        const screenshotsData = await screenshotsResponse.json();
        setScreenshots(screenshotsData.results || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching game details:', error);
        setIsLoading(false);
      }
    };
    
    fetchGameDetails();
  }, [id]);

  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {gameDetails && (
        <>
          {/* Game Banner */}
          <div className="relative h-64 md:h-96">
            <img 
              src={gameDetails.background_image} 
              alt={gameDetails.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 py-6">
              <button 
                onClick={() => navigate('/')}
                className="mb-4 text-gray-400 hover:text-white flex items-center"
              >
                <FiArrowLeft className="mr-2" /> Back to games
              </button>
              <div className="flex items-center mb-2">
                {gameDetails.released && (
                  <span className="text-gray-400 text-sm mr-4">{formatReleaseDate(gameDetails.released)}</span>
                )}
                <div className="flex items-center bg-gray-800 px-2 py-1 rounded-md">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{gameDetails.rating || 'N/A'}</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-100">{gameDetails.name}</h1>
            </div>
          </div>
          
          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-8">
              {(gameDetails.genres || []).map(genre => (
                <span key={genre.id} className="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-200">
                  {genre.name}
                </span>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-100">About</h2>
                  <div 
                    className="text-gray-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: gameDetails.description || 'No description available' }}
                  />
                </div>
                
                {/* Screenshots */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-100">Screenshots</h2>
                  <ScreenshotsCarousel screenshots={screenshots} />
                </div>
                
                {/* System Requirements */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-100">System Requirements</h2>
                  <SystemRequirements requirements={gameDetails.platforms?.find(p => p.platform.name === 'PC')?.requirements} />
                </div>
              </div>
              
              <div>
                {/* Pricing */}
                <div className="bg-gray-800 rounded-lg p-5 mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-100">Where to Buy</h2>
                  {gameDetails.stores && gameDetails.stores.length > 0 ? (
                    <div className="space-y-3">
                      {gameDetails.stores.map(store => (
                        <div key={store.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                          <span className="font-medium text-gray-200">{store.store.name}</span>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Visit
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Pricing information not available</p>
                  )}
                </div>
                
                {/* Game Info */}
                <div className="bg-gray-800 rounded-lg p-5 mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-100">Game Info</h2>
                  
                  <div className="space-y-4">
                    {/* Platforms */}
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Platforms</h3>
                      <div className="flex flex-wrap gap-2">
                        {gameDetails.platforms && gameDetails.platforms.length > 0 ? (
                          gameDetails.platforms.map(platform => (
                            <span key={platform.platform.id} className="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-200">
                              {platform.platform.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No information available</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Release Date */}
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Release Date</h3>
                      <p className="text-sm text-gray-200">{formatReleaseDate(gameDetails.released)}</p>
                    </div>
                    
                    {/* Developers */}
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Developers</h3>
                      <div className="flex flex-wrap gap-2">
                        {gameDetails.developers && gameDetails.developers.length > 0 ? (
                          gameDetails.developers.map(developer => (
                            <span key={developer.id} className="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-200">
                              {developer.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No information available</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Publishers */}
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Publishers</h3>
                      <div className="flex flex-wrap gap-2">
                        {gameDetails.publishers && gameDetails.publishers.length > 0 ? (
                          gameDetails.publishers.map(publisher => (
                            <span key={publisher.id} className="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-200">
                              {publisher.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No information available</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Rating</h3>
                      <div className="flex items-center text-gray-200">
                        <FiStar className="text-yellow-400 mr-2" />
                        <span>{gameDetails.rating || 'N/A'} / 5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center">
                  <FiBookmark className="mr-2" /> Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameHub;

