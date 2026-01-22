import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import { getUpcomingEventById, getPickupEvent, type Event } from '../../lib/microcms';
import { upcomingEvents as mockUpcomingEvents, featuredEvent } from '../../mocks/events';

export default function EventDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '一般',
    organization: '',
    message: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        if (!eventId) {
          setIsLoading(false);
          return;
        }

        // まずupcomingEventsから取得を試みる
        let foundEvent = await getUpcomingEventById(eventId);
        
        // 見つからない場合はpickupEventsから取得を試みる
        if (!foundEvent) {
          const pickupEvents = await getPickupEvent();
          foundEvent = pickupEvents.find(e => e.id === eventId) || null;
        }
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          // フォールバック：モックデータから検索
          const mockEvent = mockUpcomingEvents.find(e => e.id.toString() === eventId);
          if (mockEvent) {
            setEvent({
              ...mockEvent,
              id: mockEvent.id.toString(),
              image: { url: mockEvent.image }
            } as unknown as Event); // Force cast for now if other fields mismatch, but primarily fix ID
          } else if (featuredEvent.id.toString() === eventId) {
            setEvent({
              ...featuredEvent,
              id: featuredEvent.id.toString(),
              image: { url: featuredEvent.image }
            } as unknown as Event);
          }
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        // エラー時はモックデータを使用
        const mockEvent = mockUpcomingEvents.find(e => e.id.toString() === eventId);
        if (mockEvent) {
            setEvent({
            ...mockEvent,
            id: mockEvent.id.toString(),
            image: { url: mockEvent.image }
          } as unknown as Event);
        } else if (featuredEvent.id.toString() === eventId) {
          setEvent({
            ...featuredEvent,
            id: featuredEvent.id.toString(),
            image: { url: featuredEvent.image }
          } as unknown as Event);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new URLSearchParams();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('organization', formData.organization);
    formDataToSend.append('message', formData.message);
    formDataToSend.append('event', event?.title || '');

    try {
      const response = await fetch('https://readdy.ai/api/form/d5gjh9jihlvellpk4qqg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString()
      });

      if (response.ok) {
        alert('お申し込みありがとうございます！確認メールをお送りしました。');
        setShowRegistrationModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: '一般',
          organization: '',
          message: ''
        });
      } else {
        alert('送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      alert('送信中にエラーが発生しました。');
    }
  };

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
    <div className="min-h-screen bg-white" data-microcms-field="event">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={typeof event.image === 'string' ? event.image : event.image.url}
            alt={event.title}
            className="w-full h-full object-cover object-top"
            data-microcms-field="event.image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <span className="inline-block px-5 py-2 bg-[#FF8C00] text-white text-sm font-bold rounded-full mb-4 shadow-lg" data-microcms-field="event.category">
            {event.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" data-microcms-field="event.title">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/95">
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <i className="ri-calendar-line text-[#FF8C00]"></i>
              </div>
              <span className="text-sm" data-microcms-field="event.date">{event.date}</span>
            </div>
            <div 
              className="flex items-center cursor-pointer hover:text-[#FF8C00] transition-colors"
              onClick={() => openLocationInMap(event.location)}
            >
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <i className="ri-map-pin-line text-[#FF8C00]"></i>
              </div>
              <span className="text-sm underline" data-microcms-field="event.location">{event.location}</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <i className="ri-price-tag-3-line text-[#FF8C00]"></i>
              </div>
              <span className="text-sm font-bold text-[#FF8C00]" data-microcms-field="event.price">{event.price}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-lg mr-3">
                    <i className="ri-file-text-line text-[#FF8C00]"></i>
                  </div>
                  イベント概要
                </h2>
                <p className="text-gray-700 leading-relaxed" data-microcms-field="event.description">{event.description}</p>
              </div>

              {/* Detail Description */}
              {event.detailDescription && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-lg mr-3">
                      <i className="ri-information-line text-[#FF8C00]"></i>
                    </div>
                    詳細説明
                  </h2>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: event.detailDescription }}
                    data-microcms-field="event.detailDescription"
                  />
                </div>
              )}

              {/* Schedule */}
              {event.schedule && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-lg mr-3">
                      <i className="ri-time-line text-[#FF8C00]"></i>
                    </div>
                    スケジュール
                  </h2>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: event.schedule }}
                    data-microcms-field="event.schedule"
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 shadow-lg border border-orange-100 sticky top-24">
                <h3 className="text-xl font-bold mb-4 text-gray-900">お申し込み</h3>
                <div className="space-y-3 mb-6">
                  {event.target && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-1">対象者</p>
                      <p className="text-sm text-gray-800" data-microcms-field="event.target">{event.target}</p>
                    </div>
                  )}
                  {event.capacity && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-1">定員</p>
                      <p className="text-sm text-gray-800" data-microcms-field="event.capacity">{event.capacity}</p>
                    </div>
                  )}
                  {event.organizer && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-1">主催</p>
                      <p className="text-sm text-gray-800" data-microcms-field="event.organizer">{event.organizer}</p>
                    </div>
                  )}
                </div>
                <Button 
                  size="lg" 
                  className="w-full shadow-lg"
                  onClick={() => setShowRegistrationModal(true)}
                >
                  <i className="ri-edit-line mr-2"></i>
                  申し込む
                </Button>
              </div>

              {/* Contact Info */}
              {event.contact && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center">
                    <div className="w-6 h-6 flex items-center justify-center bg-orange-50 rounded-lg mr-2">
                      <i className="ri-customer-service-line text-[#FF8C00] text-sm"></i>
                    </div>
                    お問い合わせ
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line" data-microcms-field="event.contact">{event.contact}</p>
                </div>
              )}

              {/* Add to Calendar */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center bg-orange-50 rounded-lg mr-2">
                    <i className="ri-calendar-event-line text-[#FF8C00] text-sm"></i>
                  </div>
                  カレンダーに追加
                </h3>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                        // Simple parser for YYYY年MM月DD日
                        const dateMatch = event.date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
                        let dates = '';
                        if (dateMatch) {
                          const y = dateMatch[1];
                          const m = dateMatch[2].padStart(2, '0');
                          const d = dateMatch[3].padStart(2, '0');
                          // Assume all day event for now or 10:00-12:00
                          dates = `${y}${m}${d}T100000/${y}${m}${d}T180000`; 
                        }
                        
                        const url = new URL('https://www.google.com/calendar/render');
                        url.searchParams.append('action', 'TEMPLATE');
                        url.searchParams.append('text', event.title);
                        if (dates) url.searchParams.append('dates', dates);
                        url.searchParams.append('details', `詳細: ${window.location.href}\n\n${event.description}`);
                        url.searchParams.append('location', event.location);
                        
                        window.open(url.toString(), '_blank');
                    }}
                  >
                    <i className="ri-google-fill mr-2"></i>
                    Googleカレンダー
                  </Button>
              </div>
            </div>
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

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-3xl z-10">
              <h3 className="text-2xl font-bold text-gray-900">検定試験申し込み</h3>
              <button 
                onClick={() => setShowRegistrationModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-orange-50 rounded-xl">
                <p className="text-sm font-bold text-gray-900 mb-1">{event.title}</p>
                <p className="text-xs text-gray-600">{event.date} / {event.location}</p>
              </div>

              <form onSubmit={handleRegistration} data-readdy-form>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="reg-name" className="block text-sm font-bold text-gray-700 mb-2">
                      お名前 <span className="text-[#FF8C00]">*</span>
                    </label>
                    <input 
                      type="text"
                      id="reg-name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-bold text-gray-700 mb-2">
                      メールアドレス <span className="text-[#FF8C00]">*</span>
                    </label>
                    <input 
                      type="email"
                      id="reg-email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-bold text-gray-700 mb-2">
                      電話番号 <span className="text-[#FF8C00]">*</span>
                    </label>
                    <input 
                      type="tel"
                      id="reg-phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reg-category" className="block text-sm font-bold text-gray-700 mb-2">
                      申し込み区分 <span className="text-[#FF8C00]">*</span>
                    </label>
                    <select 
                      id="reg-category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm cursor-pointer"
                    >
                      <option value="一般">一般</option>
                      <option value="学生団体">学生団体</option>
                      <option value="企業">企業</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="reg-organization" className="block text-sm font-bold text-gray-700 mb-2">
                      所属組織・団体名
                    </label>
                    <input 
                      type="text"
                      id="reg-organization"
                      name="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reg-message" className="block text-sm font-bold text-gray-700 mb-2">
                      備考・質問事項
                    </label>
                    <textarea 
                      id="reg-message"
                      name="message"
                      rows={4}
                      maxLength={500}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all resize-none text-sm"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">{formData.message.length}/500文字</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" size="lg" className="flex-1 shadow-lg">
                      申し込む
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="lg" 
                      onClick={() => setShowRegistrationModal(false)}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
