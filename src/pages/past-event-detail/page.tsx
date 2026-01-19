import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import { getPastEventById, type PastEvent } from '../../lib/microcms';
import { pastEvents as mockPastEvents } from '../../mocks/events';

export default function PastEventDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState<PastEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        if (!eventId) {
          setIsLoading(false);
          return;
        }

        const foundEvent = await getPastEventById(eventId);
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          // フォールバック：モックデータから検索
          const mockEvent = mockPastEvents.find(e => e.id.toString() === eventId);
          if (mockEvent) {
            setEvent({
              ...mockEvent,
              image: { url: mockEvent.image }
            } as PastEvent);
          }
        }
      } catch (error) {
        console.error('Failed to fetch past event:', error);
        // エラー時はモックデータを使用
        const mockEvent = mockPastEvents.find(e => e.id.toString() === eventId);
        if (mockEvent) {
          setEvent({
            ...mockEvent,
            image: { url: mockEvent.image }
          } as PastEvent);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const openLocationInMap = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

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

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-[#FF8C00]"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">イベントが見つかりません</h1>
          <p className="text-gray-600 mb-8">お探しのイベントは存在しないか、削除された可能性があります。</p>
          <Button onClick={() => navigate('/')}>ホームに戻る</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-microcms-field="pastEvent">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={typeof event.image === 'string' ? event.image : event.image.url}
            alt={event.title}
            className="w-full h-full object-cover object-top"
            data-microcms-field="pastEvent.image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <span className="inline-block px-5 py-2 bg-[#FF8C00] text-white text-sm font-bold rounded-full mb-4 shadow-lg">
            過去のイベント
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" data-microcms-field="pastEvent.title">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/95">
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <i className="ri-calendar-line text-[#FF8C00]"></i>
              </div>
              <span className="text-sm" data-microcms-field="pastEvent.date">{event.date}</span>
            </div>
            {event.location && (
              <div 
                className="flex items-center cursor-pointer hover:text-[#FF8C00] transition-colors"
                onClick={() => openLocationInMap(event.location!)}
              >
                <div className="w-6 h-6 flex items-center justify-center mr-2">
                  <i className="ri-map-pin-line text-[#FF8C00]"></i>
                </div>
                <span className="text-sm underline" data-microcms-field="pastEvent.location">{event.location}</span>
              </div>
            )}
            {event.participants && (
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center mr-2">
                  <i className="ri-group-line text-[#FF8C00]"></i>
                </div>
                <span className="text-sm" data-microcms-field="pastEvent.participants">{event.participants}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8 mb-12">
            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-lg mr-3">
                    <i className="ri-file-text-line text-[#FF8C00]"></i>
                  </div>
                  イベント概要
                </h2>
                <p className="text-gray-700 leading-relaxed" data-microcms-field="pastEvent.description">{event.description}</p>
              </div>
            )}

            {/* Detail Description */}
            {event.detailDescription && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-lg mr-3">
                    <i className="ri-information-line text-[#FF8C00]"></i>
                  </div>
                  詳細レポート
                </h2>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: event.detailDescription }}
                  data-microcms-field="pastEvent.detailDescription"
                />
              </div>
            )}

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-lg mr-3">
                    <i className="ri-image-line text-[#FF8C00]"></i>
                  </div>
                  イベントギャラリー
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-microcms-field="pastEvent.gallery">
                  {event.gallery.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-lg group">
                      <img 
                        src={image.url}
                        alt={`${event.title} - 画像 ${index + 1}`}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="inline-flex items-center"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              イベント一覧に戻る
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
