import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSolution } from '../api/solutions';

const ViewPaste = () => {
  const { id } = useParams();
  const [paste,   setPaste]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSolution(id);
        setPaste(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-full py-10 max-w-[1200px] mx-auto px-5 lg:px-0 text-gray-400">
        Loading…
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="w-full h-full py-10 max-w-[1200px] mx-auto px-5 lg:px-0 text-red-500">
        {error || 'Solution not found.'}
      </div>
    );
  }

  return (
    <div className="w-full h-full py-10 max-w-[1200px] mx-auto px-5 lg:px-0">
      <div className="flex flex-col gap-y-5 items-start">
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={paste.title}
          disabled
          className="w-full text-black border border-input rounded-md p-2"
        />

        {/* Problem panel */}
        {paste.problem && (
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
                    navigator.clipboard.writeText(paste.problem);
                    toast.success('Copied to Clipboard');
                  }}
                >
                  <Copy className="group-hover:text-success-500" size={20} />
                </button>
              </div>
            </div>
            <textarea
              value={paste.problem}
              disabled
              className="w-full p-3 focus-visible:ring-0"
              style={{ caretColor: '#000' }}
              rows={8}
            />
          </div>
        )}

        {/* Solution panel */}
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
                  navigator.clipboard.writeText(paste.solution);
                  toast.success('Copied to Clipboard');
                }}
              >
                <Copy className="group-hover:text-success-500" size={20} />
              </button>
            </div>
          </div>
          <textarea
            value={paste.solution}
            disabled
            placeholder="Write Your Content Here...."
            className="w-full p-3 focus-visible:ring-0"
            style={{ caretColor: '#000' }}
            rows={20}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewPaste;
