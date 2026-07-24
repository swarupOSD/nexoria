import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  reorderQueue, 
  playTrack, 
  removeFromQueue 
} from '../../features/music/nexoriaMusicSlice';
import { Play, MoreHorizontal, X, ArrowLeft } from 'lucide-react';
import DropdownMenu from '../../components/DropdownMenu';

const NexoriaMusicQueue = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrack, queue, isPlaying } = useSelector(state => state.nexoriaMusic);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    dispatch(reorderQueue({
      startIndex: result.source.index,
      endIndex: result.destination.index
    }));
  };

  const handlePlayFromQueue = (index) => {
    const track = queue[index];
    dispatch(playTrack(track));
    dispatch(removeFromQueue(index));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121212] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white ml-4">Queue</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Now Playing */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Now Playing</h2>
          {currentTrack ? (
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-white/10 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 relative">
                  <img 
                    src={currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image} 
                    alt="" 
                    className="w-full h-full object-cover rounded"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-green-500 font-medium text-sm">{currentTrack.title}</span>
                  <span className="text-white/60 text-xs">{currentTrack.artist?.name || 'Unknown Artist'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">No track currently playing.</div>
          )}
        </div>

        {/* Next Up / Queue */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Next in Queue</h2>
          
          {queue.length === 0 ? (
            <div className="text-white/60 text-sm py-4">Your queue is empty.</div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="queue-list">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="flex flex-col gap-1"
                  >
                    {queue.map((track, index) => (
                      <Draggable key={`${track._id}-${index}`} draggableId={`${track._id}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-2 rounded-md group ${
                              snapshot.isDragging ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                              <div className="w-6 flex justify-center">
                                <span className="text-white/60 text-sm group-hover:hidden">{index + 1}</span>
                                <button onClick={() => handlePlayFromQueue(index)} className="hidden group-hover:block text-white">
                                  <Play className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                              <div className="w-10 h-10 shrink-0">
                                <img 
                                  src={track.coverImage || track.album?.coverImage || track.artist?.image} 
                                  alt="" 
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-white text-sm truncate font-medium">{track.title}</span>
                                <span className="text-white/60 text-xs truncate">{track.artist?.name || 'Unknown Artist'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white/60 text-xs">{formatDuration(track.duration)}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(removeFromQueue(index));
                                }}
                                className="text-white/60 hover:text-white"
                                title="Remove from queue"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button className="text-white/60 hover:text-white">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default NexoriaMusicQueue;
