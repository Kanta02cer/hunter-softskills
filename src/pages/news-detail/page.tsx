import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import { getNewsItemById, type NewsItem } from '../../lib/microcms';
import { newsItems as mockNewsItems } from '../../mocks/events';

export default function NewsDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const newsId = searchParams.get('id');
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsItem = async () => {
      setIsLoading(true);
      try {
        if (!newsId) {
          setIsLoading(false);
          return;
        }

        const foundNews = await getNewsItemById(newsId);
        
        if (foundNews) {
          setNewsItem(foundNews);
        } else {
          // フォールバック：モックデータから検索
          const mockNews = mockNewsItems.find(n => n.id.toString() === newsId);
          if (mockNews) {
            setNewsItem(mockNews);
          }
        }
      } catch (error) {
        console.error('Failed to fetch news item:', error);
        // エラー時はモックデータを使用
        const mockNews = mockNewsItems.find(n => n.id.toString() === newsId);
        if (mockNews) {
          setNewsItem(mockNews);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsItem();
  }, [newsId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF8C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-[#FF8C00]"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">お知らせが見つかりません</h1>
          <p className="text-gray-600 mb-8">お探しのお知らせは存在しないか、削除された可能性があります。</p>
          <Button onClick={() => navigate('/')}>ホームに戻る</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-microcms-field="newsItem">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-br from-orange-50/50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-sm text-gray-600 font-medium" data-microcms-field="newsItem.date">
              {newsItem.date}
            </span>
            <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-lg ${
              newsItem.category === 'NEW' ? 'bg-[#FF8C00] text-white' :
              newsItem.category === 'PRESS' ? 'bg-[#0056b3] text-white' :
              'bg-gray-200 text-gray-700'
            }`} data-microcms-field="newsItem.category">
              {newsItem.category}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight" data-microcms-field="newsItem.title">
            {newsItem.title}
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Summary */}
          {newsItem.summary && (
            <div className="mb-12 p-6 bg-orange-50 rounded-2xl border-l-4 border-[#FF8C00]">
              <p className="text-base text-gray-800 leading-relaxed" data-microcms-field="newsItem.summary">
                {newsItem.summary}
              </p>
            </div>
          )}

          {/* Main Content */}
          {newsItem.content ? (
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
              data-microcms-field="newsItem.content"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">詳細な内容はありません。</p>
            </div>
          )}

          {/* External Link */}
          {newsItem.link && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <a 
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#FF8C00] hover:text-[#FF6B00] font-bold transition-colors"
              >
                <span className="mr-2">詳細はこちら</span>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-external-link-line"></i>
                </div>
              </a>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center pt-12 border-t border-gray-200 mt-12">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="inline-flex items-center"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              お知らせ一覧に戻る
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
