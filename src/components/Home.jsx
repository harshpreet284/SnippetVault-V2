import { Copy, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { createPasteThunk, updatePasteThunk } from '../redux/pasteSlice';
import { useSearchParams } from 'react-router-dom';
import { fetchSolution } from '../api/solutions';

const Home = () => {
  const [title,    setTitle]    = useState('');
  const [problem,  setProblem]  = useState('');
  const [solution, setSolution] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const pasteId = searchParams.get('pasteId');
  const loading = useSelector((state) => state.paste.loading);
  const dispatch = useDispatch();

  // Populate form when editing — fetch from API (not Redux state) so pre-fill
  // works even if the user reached this URL via a full page reload.
  useEffect(() => {
    if (!pasteId) return;

    const load = async () => {
      try {
        const data = await fetchSolution(pasteId);
        const paste = data.data;
        setTitle(paste.title    || '');
        setProblem(paste.problem  || '');
        setSolution(paste.solution || '');
      } catch {
        toast.error('Could not load paste for editing.');
      }
    };

    load();
  }, [pasteId]);

  const createPaste = async () => {
    if (!title.trim() || !problem.trim() || !solution.trim()) {
      toast.error('Title, Problem, and Solution are required.');
      return;
    }

    const payload = {
      title:    title.trim(),
      problem:  problem.trim(),
      solution: solution.trim(),
    };

    if (pasteId) {
      await dispatch(updatePasteThunk({ id: pasteId, ...payload }));
    } else {
      await dispatch(createPasteThunk(payload));
    }

    setTitle('');
    setProblem('');
    setSolution('');
    setSearchParams({});
  };

  const resetPaste = () => {
    setTitle('');
    setProblem('');
    setSolution('');
    setSearchParams({});
  };

  return (
    <div className="w-full h-full py-10 max-w-[1200px] mx-auto px-5 lg:px-0">
      <div className="flex flex-col gap-y-5 items-start">
        {/* Title + action buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-y-3 sm:gap-x-4 justify-between items-start sm:items-center">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-black border border-input rounded-md p-2"
          />
          <div className="flex flex-row gap-x-2 w-full sm:w-auto">
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap w-full sm:w-auto disabled:opacity-60"
              onClick={createPaste}
              disabled={loading}
            >
              {pasteId ? 'Update Paste' : 'Create My Paste'}
            </button>
            {pasteId && (
              <button
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 flex justify-center items-center shrink-0"
                onClick={resetPaste}
              >
                <PlusCircle size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Problem editor — same macOS panel style */}
        <div className="w-full flex flex-col items-start relative rounded bg-opacity-10 border border-[rgba(128,121,121,0.3)] backdrop-blur-2xl">
          <div className="w-full rounded-t flex items-center justify-between gap-x-4 px-4 py-2 border-b border-[rgba(128,121,121,0.3)]">
            <div className="w-full flex gap-x-[6px] items-center select-none">
              <div className="w-[13px] h-[13px] rounded-full bg-[rgb(255,95,87)]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[rgb(254,188,46)]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[rgb(45,200,66)]" />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">Problem</span>
            <div className="w-fit flex items-center gap-x-4 px-4">
              <button
                className="flex justify-center items-center transition-all duration-300 ease-in-out group"
                onClick={() => {
                  navigator.clipboard.writeText(problem);
                  toast.success('Copied to Clipboard', { position: 'top-right' });
                }}
              >
                <Copy className="group-hover:text-success-500" size={20} />
              </button>
            </div>
          </div>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Describe the problem you encountered..."
            className="w-full p-3 focus-visible:ring-0"
            style={{ caretColor: '#000' }}
            rows={8}
          />
        </div>

        {/* Solution editor */}
        <div className="w-full flex flex-col items-start relative rounded bg-opacity-10 border border-[rgba(128,121,121,0.3)] backdrop-blur-2xl">
          <div className="w-full rounded-t flex items-center justify-between gap-x-4 px-4 py-2 border-b border-[rgba(128,121,121,0.3)]">
            <div className="w-full flex gap-x-[6px] items-center select-none">
              <div className="w-[13px] h-[13px] rounded-full bg-[rgb(255,95,87)]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[rgb(254,188,46)]" />
              <div className="w-[13px] h-[13px] rounded-full bg-[rgb(45,200,66)]" />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">Solution</span>
            <div className="w-fit flex items-center gap-x-4 px-4">
              <button
                className="flex justify-center items-center transition-all duration-300 ease-in-out group"
                onClick={() => {
                  navigator.clipboard.writeText(solution);
                  toast.success('Copied to Clipboard', { position: 'top-right' });
                }}
              >
                <Copy className="group-hover:text-success-500" size={20} />
              </button>
            </div>
          </div>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Write your solution here..."
            className="w-full p-3 focus-visible:ring-0"
            style={{ caretColor: '#000' }}
            rows={12}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
