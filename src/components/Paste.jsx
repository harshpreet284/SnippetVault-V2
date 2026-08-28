import { Calendar, Copy, Eye, PencilLine, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef, useCallback } from 'react';
import { deletePasteThunk, fetchSolutions, searchSolutionsThunk, clearSearch, semanticSearchThunk, setSearchMode } from '../redux/pasteSlice';
import { FormatDate } from '../utlis/formatDate';

const Paste = () => {
  const pastes        = useSelector((state) => state.paste.pastes);
  const loading       = useSelector((state) => state.paste.loading);
  const searchResults = useSelector((state) => state.paste.searchResults);
  const isSearchActive  = useSelector((state) => state.paste.isSearchActive);
  const searchLoading = useSelector((state) => state.paste.searchLoading);
  const searchMode    = useSelector((state) => state.paste.searchMode);
  const dispatch = useDispatch();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchTerm,  setSearchTerm]  = useState('');
  const [technology,  setTechnology]  = useState('');
  const [language,    setLanguage]    = useState('');
  const [project,     setProject]     = useState('');
  const [tag,         setTag]         = useState('');
  const [semanticQuery, setSemanticQuery] = useState('');

  // Track whether any filter/search is non-empty
  const hasFilters = searchTerm.trim() || technology.trim() || language.trim() || project.trim() || tag.trim() || semanticQuery.trim();

  // ── Debounce ref (for keyword search field only) ───────────────────────────
  const debounceRef = useRef(null);

  // ── Fetch full list on mount ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchSolutions());
  }, [dispatch]);

  // ── Cleanup debounce on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Trigger backend search ─────────────────────────────────────────────────
  const runSearch = useCallback(
    (params) => {
      // If all params are empty strings, reset to full list instead of searching
      const anyActive = Object.values(params).some((v) => v.trim());
      if (!anyActive) {
        dispatch(clearSearch());
        return;
      }
      dispatch(searchSolutionsThunk(params));
    },
    [dispatch]
  );

  // Debounced handler for the keyword input (400 ms)
  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch({ q: val, technology, language, project, tag });
    }, 400);
  };

  // Immediate handler for discrete filter inputs
  const handleFilterChange = (setter, field) => (e) => {
    const val = e.target.value;
    setter(val);
    // Build params with the freshly updated value for the changed field
    const params = {
      q: searchTerm,
      technology,
      language,
      project,
      tag,
      [field]: val,   // override with the new value before state update settles
    };
    runSearch(params);
  };

  // ── Clear all filters ──────────────────────────────────────────────────────
  const handleClear = () => {
    setSearchTerm('');
    setTechnology('');
    setLanguage('');
    setProject('');
    setTag('');
    setSemanticQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    dispatch(clearSearch());
  };

  // ── Mode Toggle ────────────────────────────────────────────────────────────
  const handleModeSwitch = (mode) => {
    if (mode === searchMode) return;
    dispatch(setSearchMode(mode));
    setSearchTerm('');
    setTechnology('');
    setLanguage('');
    setProject('');
    setTag('');
    setSemanticQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  // ── Semantic Search Submit ─────────────────────────────────────────────────
  const handleSemanticSearch = (e) => {
    e.preventDefault();
    if (semanticQuery.trim()) {
      dispatch(semanticSearchThunk(semanticQuery));
    } else {
      dispatch(clearSearch());
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    dispatch(deletePasteThunk(id));
  };

  // ── Decide what to render ──────────────────────────────────────────────────
  const displayed     = isSearchActive ? searchResults : pastes;
  const isLoading     = isSearchActive ? searchLoading : loading;

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputCls = 'flex-1 min-w-[130px] bg-transparent focus:outline-none text-sm placeholder-gray-400';

  return (
    <div className="w-full h-full py-10 max-w-[1200px] mx-auto px-5 lg:px-0">
      <div className="flex flex-col gap-y-3">

        {/* ── Mode Toggle ── */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => handleModeSwitch('keyword')}
            className={`px-4 py-2 rounded-[0.3rem] border transition-colors ${searchMode === 'keyword' ? 'bg-gray-200 border-gray-400 font-semibold text-black' : 'bg-white border-[rgba(128,121,121,0.3)] text-gray-600 hover:bg-gray-50'}`}
          >
            🔍 Keyword
          </button>
          <button
            onClick={() => handleModeSwitch('semantic')}
            className={`px-4 py-2 rounded-[0.3rem] border transition-colors ${searchMode === 'semantic' ? 'bg-gray-200 border-gray-400 font-semibold text-black' : 'bg-white border-[rgba(128,121,121,0.3)] text-gray-600 hover:bg-gray-50'}`}
          >
            ✨ Semantic
          </button>
        </div>

        {/* ── Search + Filter area ── */}
        <div className="flex flex-col gap-y-2 mt-2">
          {searchMode === 'keyword' ? (
            <>
              {/* Keyword row */}
              <div className="w-full flex gap-3 px-4 py-2 rounded-[0.3rem] border border-[rgba(128,121,121,0.3)]">
                <input
                  type="search"
                  id="paste-search"
                  placeholder="Search pastes..."
                  className={inputCls}
                  value={searchTerm}
                  onChange={handleKeywordChange}
                />
                {hasFilters && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-gray-400 hover:text-red-500 whitespace-nowrap transition-colors duration-150"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Filter row */}
              <div className="w-full flex flex-wrap gap-2 px-4 py-2 rounded-[0.3rem] border border-[rgba(128,121,121,0.3)]">
                <input
                  type="text"
                  id="filter-technology"
                  placeholder="Technology (e.g. React)"
                  className={inputCls}
                  value={technology}
                  onChange={handleFilterChange(setTechnology, 'technology')}
                />
                <input
                  type="text"
                  id="filter-language"
                  placeholder="Language (e.g. JavaScript)"
                  className={inputCls}
                  value={language}
                  onChange={handleFilterChange(setLanguage, 'language')}
                />
                <input
                  type="text"
                  id="filter-project"
                  placeholder="Project"
                  className={inputCls}
                  value={project}
                  onChange={handleFilterChange(setProject, 'project')}
                />
                <input
                  type="text"
                  id="filter-tag"
                  placeholder="Tag"
                  className={inputCls}
                  value={tag}
                  onChange={handleFilterChange(setTag, 'tag')}
                />
              </div>
            </>
          ) : (
            <form onSubmit={handleSemanticSearch} className="w-full flex gap-3 px-4 py-2 rounded-[0.3rem] border border-[rgba(128,121,121,0.3)]">
              <input
                type="search"
                placeholder="Describe what you're looking for... (e.g. 'how to parse a JWT')"
                className={inputCls}
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
              />
              <button
                type="submit"
                className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
              >
                Search
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-red-500 whitespace-nowrap transition-colors duration-150"
                >
                  Clear search
                </button>
              )}
            </form>
          )}
        </div>

        {/* ── Results section ── */}
        <div className="flex flex-col border border-[rgba(128,121,121,0.3)] py-4 rounded-[0.4rem]">
          <h2 className="px-4 text-4xl font-bold border-b border-[rgba(128,121,121,0.3)] pb-4">
            {isSearchActive
              ? (searchMode === 'semantic' ? `Semantic Results (${displayed.length})` : `Search Results (${displayed.length})`)
              : 'All Pastes'}
          </h2>

          <div className="w-full px-4 pt-4 flex flex-col gap-y-5">
            {isLoading ? (
              <div className="text-lg text-center w-full text-gray-400 py-4">
                Loading…
              </div>
            ) : displayed.length > 0 ? (
              displayed.map((paste) => (
                <div
                  key={paste?._id}
                  className="border border-[rgba(128,121,121,0.3)] w-full gap-y-6 justify-between flex flex-col sm:flex-row p-4 rounded-[0.3rem]"
                >
                  {/* Title and preview */}
                  <div className="w-full sm:w-[50%] flex flex-col space-y-3">
                    <p className="text-4xl font-semibold break-words">{paste?.title}</p>
                    <p className="text-sm font-normal line-clamp-3 max-w-full sm:max-w-[80%] text-[#707070]">
                      {paste?.solution}
                    </p>
                  </div>

                  {/* Action icons */}
                  <div className="flex flex-col gap-y-4 sm:items-end">
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      {/* Edit */}
                      <button className="p-2 rounded-[0.2rem] bg-white border border-[#c7c7c7] hover:bg-transparent group hover:border-blue-500">
                        <a href={`/?pasteId=${paste?._id}`}>
                          <PencilLine className="text-black group-hover:text-blue-500" size={20} />
                        </a>
                      </button>

                      {/* Delete */}
                      <button
                        className="p-2 rounded-[0.2rem] bg-white border border-[#c7c7c7] hover:bg-transparent group hover:border-pink-500"
                        onClick={() => handleDelete(paste?._id)}
                      >
                        <Trash2 className="text-black group-hover:text-pink-500" size={20} />
                      </button>

                      {/* View */}
                      <button className="p-2 rounded-[0.2rem] bg-white border border-[#c7c7c7] hover:bg-transparent group hover:border-orange-500">
                        <a href={`/pastes/${paste?._id}`} target="_blank" rel="noreferrer">
                          <Eye className="text-black group-hover:text-orange-500" size={20} />
                        </a>
                      </button>

                      {/* Copy solution */}
                      <button
                        className="p-2 rounded-[0.2rem] bg-white border border-[#c7c7c7] hover:bg-transparent group hover:border-green-500"
                        onClick={() => {
                          navigator.clipboard.writeText(paste?.solution);
                          toast.success('Copied to Clipboard');
                        }}
                      >
                        <Copy className="text-black group-hover:text-green-500" size={20} />
                      </button>
                    </div>

                    {/* Date */}
                    <div className="gap-x-2 flex">
                      <Calendar className="text-black" size={20} />
                      {FormatDate(paste?.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : isSearchActive ? (
              /* Search returned no results */
              <div className="text-2xl text-center w-full text-chileanFire-500 py-2">
                No solutions matched your search. Try different keywords or clear the filters.
              </div>
            ) : (
              /* Vault is empty */
              <div className="text-2xl text-center w-full text-chileanFire-500 py-2">
                Your vault is empty. Create your first solution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paste;
