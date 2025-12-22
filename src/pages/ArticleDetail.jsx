import { useParams, Link, Navigate } from 'react-router-dom';
import { useArticle } from '../hooks/useArticles';
import Nav from '../components/Nav';
import { MOSQUE } from '../config';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/youtube';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { article, loading, error } = useArticle(slug);

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-zinc-400">Artikel laden...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div>
        <Nav />
        <div className="mx-auto w-[min(1100px,92%)] py-12">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-400">Artikel niet gevonden</h2>
            <p className="text-zinc-400 mt-2">
              Het artikel dat je zoekt bestaat niet of is niet meer beschikbaar.
            </p>
            <Link
              to="/kennisbank"
              className="inline-block mt-4 font-bold bg-primary text-black px-4 py-2 rounded-lg hover:brightness-110"
            >
              Terug naar kennisbank
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />

      <article className="py-10 md:py-12">
        <div className="mx-auto w-[min(900px,92%)]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/kennisbank" className="hover:text-primary">Kennisbank</Link>
            <span>/</span>
            <span className="text-zinc-300">{article.title}</span>
          </div>

          {/* Category Badge */}
          {article.category && (
            <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">
              {article.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mt-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-4 text-sm text-zinc-400">
            {article.author && (
              <span>Door {article.author}</span>
            )}
            {article.published_at && (
              <>
                <span>•</span>
                <span>
                  {new Date(article.published_at).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </>
            )}
          </div>

          {/* Featured Media (Image or YouTube Video) */}
          {article.image_url && (
            <div className="mt-8 rounded-xl overflow-hidden border border-zinc-800">
              {isYouTubeUrl(article.image_url) ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(article.image_url)}
                    title={article.title}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : article.image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video
                  src={article.image_url}
                  controls
                  className="w-full h-auto"
                />
              ) : (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <div className="mt-8 text-lg text-zinc-300 font-medium italic border-l-4 border-primary pl-4 py-2">
              {article.excerpt}
            </div>
          )}

          {/* Content */}
          <div 
            className="mt-8 prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-zinc-300 prose-ol:text-zinc-300
              prose-li:my-1
              prose-blockquote:border-l-4 prose-blockquote:border-primary 
              prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-400
              prose-img:rounded-lg prose-img:border prose-img:border-zinc-800
              prose-code:text-primary prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Back button */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <Link
              to="/kennisbank"
              className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Terug naar kennisbank
            </Link>
          </div>
        </div>
      </article>

      <footer className="border-t border-zinc-800 bg-[#0a0a0a]">
        <div className="mx-auto w-[min(1100px,92%)] flex flex-wrap items-center justify-between gap-3 py-4">
          <p>&copy; {new Date().getFullYear()} {MOSQUE.name}. Alle rechten voorbehouden.</p>
          <div className="flex gap-3 text-zinc-400">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to="/kennisbank">Kennisbank</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
