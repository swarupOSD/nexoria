import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getMovieDetails, getTVDetails, tmdbBackdrop, tmdbPoster } from '../utils/tmdb';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import FallbackImage from '../components/FallbackImage';

const TMDBMovieDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(false);
      try {
        let res;
        if (type === 'tv' || type === 'tv-shows') {
          res = await getTVDetails(id);
        } else {
          res = await getMovieDetails(id);
        }
        
        if (res && res.id) {
          setData(res);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchDetails();
    }
  }, [type, id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#030303]">
      <div className="w-10 h-10 border-2 border-slate-700 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  if (error || !data) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Content Not Found</h2>
        <p className="text-slate-400 mb-6">We couldn't load the details for this item.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          Go Back
        </button>
      </div>
    );
  }

  const title = data.title || data.name;
  const releaseDate = data.release_date || data.first_air_date;
  const runtime = data.runtime || (data.episode_run_time && data.episode_run_time[0]);
  
  // Find a trailer video if available
  const trailer = data.videos?.results?.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer');

  return (
    <div className="min-h-screen bg-[#030303] text-white pb-20 relative">
      <SEO title={`${title} | Nexoria MovieBox`} description={data.overview} image={tmdbBackdrop(data.backdrop_path)} />
      
      {/* Hero Banner Area */}
      <div className="relative w-full h-[819px] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full" style={{ backgroundImage: `url('${tmdbBackdrop(data.backdrop_path) || tmdbPoster(data.poster_path)}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20"></div>
        
        {/* Back Button */}
        <div className="absolute top-20 md:top-24 left-6 z-20">
          <BackButton fallbackPath="/moviebox" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end pb-margin-desktop px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto z-10">
          <div className="flex flex-col md:flex-row gap-12 items-end w-full">
            {/* Poster */}
            <div className="hidden md:block w-72 flex-shrink-0 relative group">
              <FallbackImage 
                src={tmdbPoster(data.poster_path)} 
                alt={title} 
                className="w-full h-auto rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 border border-transparent hover:border-primary/30 hover:shadow-[0_0_15px_rgba(255,211,137,0.15)]"
              />
            </div>

            {/* Details */}
            <div className="flex-col flex gap-6 pb-4 w-full">
              <div className="flex gap-3">
                <span className="px-2 py-1 border border-outline/50 rounded font-label-caps text-[10px] text-on-surface bg-surface-container/30 backdrop-blur-md uppercase">
                  {type === 'tv' || type === 'tv-shows' ? 'TV Series' : 'Movie'}
                </span>
                {releaseDate && <span className="px-2 py-1 border border-outline/50 rounded font-label-caps text-[10px] text-on-surface bg-surface-container/30 backdrop-blur-md">{releaseDate.substring(0, 4)}</span>}
              </div>

              <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl font-black text-on-surface leading-[1.05] tracking-tight drop-shadow-2xl">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-bold text-on-surface-variant mb-2">
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/5 shadow-inner">
                  <Star className="w-4 h-4 text-primary fill-primary" /> 
                  <span className="text-on-surface">{data.vote_average?.toFixed(1) || 'NR'}</span> IMDB
                </span>
                {runtime > 0 && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {runtime} min</span>}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {data.genres?.map(g => (
                  <span key={g.id} className="px-4 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-full text-xs font-bold transition-colors text-on-surface-variant hover:text-on-surface">
                    {g.name}
                  </span>
                ))}
              </div>

              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-3xl mb-4 drop-shadow-md">
                {data.overview || 'No overview available for this title.'}
              </p>

              {/* Cast Preview */}
              {data.credits?.cast && data.credits.cast.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-bold mb-3 text-on-surface">Top Cast</h3>
                  <div className="flex flex-wrap gap-4">
                    {data.credits.cast.slice(0, 4).map(actor => (
                      <div key={actor.id} className="flex items-center gap-3 bg-surface-container-low rounded-full pr-4 border border-outline-variant/30">
                        <img 
                          src={tmdbPoster(actor.profile_path)} 
                          alt={actor.name}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface">{actor.name}</span>
                          <span className="text-[10px] text-on-surface-variant max-w-[100px] truncate">{actor.character}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {trailer && (
        <div className="container mx-auto px-4 md:px-8 mt-12 mb-12 relative z-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Play className="w-6 h-6 text-primary" /> Official Trailer</h2>
          <div className="aspect-video w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <iframe 
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default TMDBMovieDetail;
