import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import { getUpcomingEvents, getPastEvents, getNewsItems, getPartners, getPickupEvent, type Event, type NewsItem, type Partner, type PastEvent } from '../../lib/microcms';
import { upcomingEvents as mockUpcomingEvents, pastEvents as mockPastEvents, newsItems as mockNewsItems, featuredEvent } from '../../mocks/events';
import { sponsors as mockSponsors, mockPartners } from '../../mocks/partners';

export default function HomePage() {
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '一般',
    organization: '',
    message: ''
  });
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // microCMSからのデータ
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sponsors, setSponsors] = useState<Partner[]>([]);
  const [pickupEvent, setPickupEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [upcomingData, pastData, newsData, partnersData, pickupData] = await Promise.all([
          getUpcomingEvents(),
          getPastEvents(),
          getNewsItems(),
          getPartners(),
          getPickupEvent()
        ]);

        // microCMSからデータが取得できた場合は使用、できない場合はモックデータを使用
        setUpcomingEvents(upcomingData.length > 0 ? upcomingData : mockUpcomingEvents.map(e => ({
          ...e,
          id: e.id.toString(),
          image: { url: e.image }
        } as unknown as Event)));
        setPastEvents(pastData.length > 0 ? pastData : mockPastEvents.map(e => ({
          ...e,
          id: e.id.toString(),
          image: { url: e.image }
        } as unknown as PastEvent)));
        setNewsItems(newsData.length > 0 ? newsData : mockNewsItems.map(n => ({
          ...n,
          id: n.id.toString()
        } as unknown as NewsItem)));
        
        // パートナーと協賛企業を区分け
        // typeが配列の場合と文字列の場合の両方に対応
        const partnersList = partnersData.filter(p => {
          const typeValue = Array.isArray(p.type) ? p.type[0] : p.type;
          return typeValue === 'partner';
        });
        const sponsorsList = partnersData.filter(p => {
          const typeValue = Array.isArray(p.type) ? p.type[0] : p.type;
          return typeValue === 'sponsor';
        });
        
        // 協賛企業の設定
        if (sponsorsList.length > 0) {
          setSponsors(sponsorsList);
        } else {
          // microCMSにsponsorがない場合はモックデータを使用
          setSponsors(mockSponsors.map(s => ({
            id: s.id.toString(),
            name: s.name,
            logo: { url: s.logo },
            type: 'sponsor' as const
          } as unknown as Partner)));
        }
        
        // パートナー団体の設定
        if (partnersList.length > 0) {
          setPartners(partnersList);
        } else {
          // microCMSにpartnerがない場合はモックデータを使用
          setPartners(mockPartners.map(p => ({
            ...p,
            id: p.id.toString(),
            logo: { url: p.logo },
            type: 'partner' as const
          } as unknown as Partner)));
        }
        
        // PickUpイベント：microCMSから取得できた場合は最初の1件を使用、できない場合はモックデータ
        
        if (pickupData.length > 0) {
          const pickupItem = pickupData[0];
          
          // 画像が存在しない、または空の場合はモックデータの画像を使用
          const hasValidImage = pickupItem.image && 
            (typeof pickupItem.image === 'string' || 
             (typeof pickupItem.image === 'object' && pickupItem.image.url && pickupItem.image.url.trim() !== ''));
          
          if (!hasValidImage) {
            console.warn('⚠️ PickUpイベントに有効な画像がありません。モックデータの画像を使用します。');
            setPickupEvent({
              ...pickupItem,
              image: { url: featuredEvent.image }
            } as Event);
          } else {
            setPickupEvent(pickupItem);
          }
        } else {
          console.log('⚠️ pickupDataが空のため、モックデータを使用します');
          setPickupEvent({
            ...featuredEvent,
            id: featuredEvent.id.toString(),
            image: { url: featuredEvent.image }
          } as unknown as Event);
        }
      } catch (error) {
        console.error('Failed to fetch data from microCMS:', error);
        // エラー時はモックデータを使用
        setUpcomingEvents(mockUpcomingEvents.map(e => ({
          ...e,
          id: e.id.toString(),
          image: { url: e.image }
        } as unknown as Event)));
        setPastEvents(mockPastEvents.map(e => ({
          ...e,
          id: e.id.toString(),
          image: { url: e.image }
        } as unknown as PastEvent)));
        setNewsItems(mockNewsItems.map(n => ({
          ...n,
          id: n.id.toString()
        } as unknown as NewsItem)));
        setPartners(mockPartners.map(p => ({
          ...p,
          id: p.id.toString(),
          logo: { url: p.logo },
          type: 'partner' as const
        } as unknown as Partner)));
        setSponsors(mockSponsors.map(s => ({
          id: s.id.toString(),
          name: s.name,
          logo: { url: s.logo },
          type: 'sponsor' as const
        } as unknown as Partner)));
        setPickupEvent({
          ...featuredEvent,
          id: featuredEvent.id.toString(),
          image: { url: featuredEvent.image }
        } as unknown as Event);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEventModal = (event: any) => {
    // Navigate to event detail page instead of opening modal
    window.REACT_APP_NAVIGATE(`/event-detail?id=${event.id}`);
  };

  const openPastEventDetail = (event: any) => {
    window.REACT_APP_NAVIGATE(`/past-event-detail?id=${event.id}`);
  };

  const openNewsDetail = (newsId: string) => {
    window.REACT_APP_NAVIGATE(`/news-detail?id=${newsId}`);
  };

  const handleEventRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formDataToSend = new URLSearchParams();
    
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('organization', formData.organization);
    formDataToSend.append('message', formData.message);
    formDataToSend.append('event', selectedEvent?.title || '');

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
        setShowEventModal(false);
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new URLSearchParams();
    formDataToSend.append('name', contactFormData.name);
    formDataToSend.append('email', contactFormData.email);
    formDataToSend.append('subject', contactFormData.subject);
    formDataToSend.append('message', contactFormData.message);

    try {
      const response = await fetch('https://readdy.ai/api/form/d5gjh3rihlvellpk4qq0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString()
      });

      if (response.ok) {
        alert('お問い合わせありがとうございます！担当者より折り返しご連絡いたします。');
        setContactFormData({
          name: '',
          email: '',
          subject: '',
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://readdy.ai/api/search-image?query=inspiring%20young%20japanese%20professionals%20and%20university%20students%20looking%20toward%20bright%20future%20with%20determination%20modern%20clean%20white%20space%20orange%20accent%20lighting%20showcasing%20potential%20growth%20and%20career%20possibilities%20japanese%20people%20in%20business%20casual%20attire&width=1920&height=1080&seq=hero-softskill-jp-001&orientation=landscape"
            alt="Hero Background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            若者の潜在能力と<br />可能性を視覚化する
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-4 text-white/95">
            進路選択、就活、自分が何をしたいのか
          </p>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 text-white/95">
            未知数な未来の不安を解決する
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-10 text-white font-bold">
            経験×思考力を育てる
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button size="lg" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
              検定を探す
            </Button>
            <Button size="lg" variant="outline" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-[#FF8C00] w-full sm:w-auto" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              企業の方はこちら
            </Button>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section id="concept" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
            ソフトスキル検定
          </h2>
          <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto mb-6 sm:mb-10"></div>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
            AI社会で必要となるデータベースに左右されない人間の生み出す力、どんな環境でも必要とされる思考力や行動力、チーム力など基盤となる能力をソフトスキルといいます。
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
            当検定は、ソフトスキルを育成し、自身の能力をアウトプットする場を提供すべくPBL学習を導入した検定を運営します。
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
            学歴や知識が高いことが評価されているのは、単に、理解しやすいデータとして示すことができるからです。
          </p>
        </div>
      </section>

      {/* Featured Event - PickUp */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-orange-50/50 to-white" data-microcms-field="pickupEvent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              PickUp イベント
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto"></div>
          </div>

            <div className="flex justify-center">
              <div 
                className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col"
                onClick={() => window.REACT_APP_NAVIGATE(`/event-detail?id=${pickupEvent.id}`)}
                data-microcms-field="pickupEvent"
              >
                <div className="relative w-full aspect-video md:aspect-[19/6] flex-shrink-0 bg-gray-100">
                  {(() => {
                    const imageUrl = typeof pickupEvent.image === 'string' 
                      ? pickupEvent.image 
                      : pickupEvent.image?.url || '';
                    
                    // 画像URLが存在する場合のみ画像を表示
                    if (imageUrl && imageUrl.trim() !== '') {
                      return (
                        <img 
                          src={imageUrl}
                          alt={pickupEvent.title}
                          className="w-full h-full object-cover object-top pointer-events-none"
                          data-microcms-field="pickupEvent.image"
                          onError={(e) => {
                            console.error('❌ 画像の読み込みに失敗:', pickupEvent.image);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                  <span class="text-sm">画像なし</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <span className="text-sm">画像が設定されていません</span>
                        </div>
                      );
                    }
                  })()}
                  <span className="absolute top-4 right-4 px-4 py-1.5 bg-[#FF8C00] text-white text-xs font-bold rounded-full shadow-md" data-microcms-field="pickupEvent.category">
                    {pickupEvent.category}
                  </span>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900" data-microcms-field="pickupEvent.title">
                    {pickupEvent.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-5 line-clamp-3" data-microcms-field="pickupEvent.description">
                    {pickupEvent.description}
                  </p>
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center text-gray-700">
                      <div className="w-7 h-7 flex items-center justify-center mr-2 bg-orange-50 rounded-lg flex-shrink-0">
                        <i className="ri-calendar-line text-[#FF8C00] text-sm"></i>
                      </div>
                      <span className="text-sm font-medium" data-microcms-field="pickupEvent.date">{pickupEvent.date}</span>
                    </div>
                    <div 
                      className="flex items-center text-gray-700 cursor-pointer hover:text-[#FF8C00] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLocationInMap(pickupEvent.location);
                      }}
                    >
                      <div className="w-7 h-7 flex items-center justify-center mr-2 bg-orange-50 rounded-lg flex-shrink-0">
                        <i className="ri-map-pin-line text-[#FF8C00] text-sm"></i>
                      </div>
                      <span className="text-sm underline" data-microcms-field="pickupEvent.location">{pickupEvent.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-lg font-bold text-[#FF8C00]" data-microcms-field="pickupEvent.price">{pickupEvent.price}</span>
                    <Button>詳細を見る</Button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Upcoming Events Carousel - microCMS編集可能 */}
      <section id="events" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6" data-microcms-field="upcomingEvents">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              開催予定の検定試験
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto"></div>
          </div>
          
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div className="overflow-x-auto overflow-y-hidden pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 w-max">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    className="w-[60vw] sm:w-[50vw] flex-shrink-0 group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer aspect-square border border-gray-100"
                    onClick={() => openEventModal(event)}
                    data-microcms-field={`upcomingEvents.${index}`}
                  >
                    <img 
                      src={typeof event.image === 'string' ? event.image : event.image.url}
                      alt={event.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                      data-microcms-field={`upcomingEvents.${index}.image`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity pointer-events-none"></div>
                    <span className="absolute top-2 right-2 px-2 py-1 bg-[#FF8C00] text-white text-[10px] sm:text-xs font-bold rounded-full shadow-md z-10 pointer-events-none" data-microcms-field={`upcomingEvents.${index}.category`}>
                      {event.category}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white pointer-events-none">
                      <h3 className="text-sm sm:text-base font-bold mb-1 line-clamp-2 leading-tight" data-microcms-field={`upcomingEvents.${index}.title`}>
                        {event.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-white/90 mb-2 line-clamp-1" data-microcms-field={`upcomingEvents.${index}.description`}>
                        {event.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center text-white/95">
                          <i className="ri-calendar-line text-[#FF8C00] text-xs mr-1.5"></i>
                          <span className="text-[10px] sm:text-xs" data-microcms-field={`upcomingEvents.${index}.date`}>{event.date}</span>
                        </div>
                        <div className="flex items-center text-white/95">
                          <i className="ri-map-pin-line text-[#FF8C00] text-xs mr-1.5"></i>
                          <span className="text-[10px] sm:text-xs line-clamp-1" data-microcms-field={`upcomingEvents.${index}.location`}>{event.location}</span>
                        </div>
                        <div className="flex items-center text-white/95 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-[#FF8C00]" data-microcms-field={`upcomingEvents.${index}.price`}>{event.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal Scroll */}
          <div className="hidden md:block">
            <div className="overflow-x-auto overflow-y-hidden pb-6 -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-6 w-max">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    className="w-[300px] flex-shrink-0 group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer aspect-square border border-gray-100"
                    onClick={() => openEventModal(event)}
                    data-microcms-field={`upcomingEvents.${index}`}
                  >
                    <img 
                      src={typeof event.image === 'string' ? event.image : event.image.url}
                      alt={event.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                      data-microcms-field={`upcomingEvents.${index}.image`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity pointer-events-none"></div>
                    <span className="absolute top-4 right-4 px-4 py-1.5 bg-[#FF8C00] text-white text-xs font-bold rounded-full shadow-md z-10 pointer-events-none" data-microcms-field={`upcomingEvents.${index}.category`}>
                      {event.category}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight" data-microcms-field={`upcomingEvents.${index}.title`}>
                        {event.title}
                      </h3>
                      <p className="text-sm text-white/90 mb-3 line-clamp-2" data-microcms-field={`upcomingEvents.${index}.description`}>
                        {event.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-white/95">
                          <i className="ri-calendar-line text-[#FF8C00] text-sm mr-2"></i>
                          <span className="text-sm" data-microcms-field={`upcomingEvents.${index}.date`}>{event.date}</span>
                        </div>
                        <div className="flex items-center text-white/95">
                          <i className="ri-map-pin-line text-[#FF8C00] text-sm mr-2"></i>
                          <span className="text-sm line-clamp-1" data-microcms-field={`upcomingEvents.${index}.location`}>{event.location}</span>
                        </div>
                        <div className="flex items-center text-white/95 mt-2">
                          <span className="text-base font-bold text-[#FF8C00]" data-microcms-field={`upcomingEvents.${index}.price`}>{event.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events Carousel - microCMS編集可能 */}
      <section id="past-events" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-orange-50/50 to-white" data-microcms-field="pastEvents">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              過去の開催イベント
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto"></div>
          </div>
          
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div className="overflow-x-auto overflow-y-hidden pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 w-max">
                {pastEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    className="w-[60vw] sm:w-[50vw] flex-shrink-0 group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer aspect-square border border-gray-100"
                    onClick={() => openPastEventDetail(event)}
                    data-microcms-field={`pastEvents.${index}`}
                  >
                    <img 
                      src={typeof event.image === 'string' ? event.image : event.image.url}
                      alt={event.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                      data-microcms-field={`pastEvents.${index}.image`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white pointer-events-none">
                      <p className="text-[10px] sm:text-xs mb-1 text-[#FF8C00] font-bold" data-microcms-field={`pastEvents.${index}.date`}>{event.date}</p>
                      <h3 className="text-sm sm:text-base font-bold line-clamp-2 leading-tight" data-microcms-field={`pastEvents.${index}.title`}>{event.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal Scroll */}
          <div className="hidden md:block">
            <div className="overflow-x-auto overflow-y-hidden pb-6 -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-6 w-max">
                {pastEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    className="w-[380px] flex-shrink-0 group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer aspect-video border border-gray-100 transform hover:-translate-y-2 transition-all duration-300"
                    onClick={() => openPastEventDetail(event)}
                    data-microcms-field={`pastEvents.${index}`}
                  >
                    <div className="relative w-full aspect-square">
                      <img 
                        src={typeof event.image === 'string' ? event.image : event.image.url}
                        alt={event.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                        data-microcms-field={`pastEvents.${index}.image`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                        <p className="text-sm mb-2 text-[#FF8C00] font-bold" data-microcms-field={`pastEvents.${index}.date`}>{event.date}</p>
                        <h3 className="text-xl font-bold" data-microcms-field={`pastEvents.${index}.title`}>{event.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors - 協賛企業 */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-orange-50/50 to-white" data-microcms-field="sponsors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              協賛企業
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto"></div>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {sponsors.concat(sponsors).map((sponsor, index) => (
                <div 
                  key={`${sponsor.id}-${index}`}
                  className="flex-shrink-0 w-48 sm:w-64 h-24 sm:h-32 mx-4 sm:mx-6 flex items-center justify-center hover:scale-110 transition-all duration-300"
                  data-microcms-field={`sponsors.${index % sponsors.length}`}
                >
                  <img 
                    src={typeof sponsor.logo === 'string' ? sponsor.logo : sponsor.logo.url}
                    alt={sponsor.name}
                    className="max-w-full max-h-full object-contain"
                    data-microcms-field={`sponsors.${index % sponsors.length}.logo`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners - パートナー団体 */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6" data-microcms-field="partners">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              パートナー団体
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto"></div>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {partners.concat(partners).map((partner, index) => (
                <div 
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 w-48 sm:w-64 h-24 sm:h-32 mx-4 sm:mx-6 flex items-center justify-center hover:scale-110 transition-all duration-300"
                  data-microcms-field={`partners.${index % partners.length}`}
                >
                  <img 
                    src={typeof partner.logo === 'string' ? partner.logo : partner.logo.url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    data-microcms-field={`partners.${index % partners.length}.logo`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Carousel - microCMS編集可能 */}
      <section id="news" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-orange-50/50 to-white" data-microcms-field="newsItems">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              最新のお知らせ
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto"></div>
          </div>
          
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div className="overflow-x-auto overflow-y-hidden pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 w-max">
                {newsItems.map((item, index) => (
                  <div 
                    key={item.id}
                    onClick={() => openNewsDetail(item.id)}
                    className="w-[85vw] flex-shrink-0 bg-white rounded-2xl shadow-lg p-5 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 group min-h-[180px] flex flex-col"
                    data-microcms-field={`newsItems.${index}`}
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap pointer-events-none">
                      <span className="text-xs text-gray-600 font-medium" data-microcms-field={`newsItems.${index}.date`}>
                        {item.date}
                      </span>
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${
                        item.category === 'NEW' ? 'bg-[#FF8C00] text-white' :
                        item.category === 'PRESS' ? 'bg-[#0056b3] text-white' :
                        'bg-gray-200 text-gray-700'
                      }`} data-microcms-field={`newsItems.${index}.category`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 group-hover:text-[#FF8C00] transition-colors font-medium leading-relaxed line-clamp-3 flex-1 pointer-events-none" data-microcms-field={`newsItems.${index}.title`}>
                      {item.title}
                    </p>
                    <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 pointer-events-none">
                      <div className="w-7 h-7 flex items-center justify-center bg-orange-50 rounded-full group-hover:bg-[#FF8C00] transition-colors">
                        <i className="ri-arrow-right-line text-[#FF8C00] group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal Scroll */}
          <div className="hidden md:block">
            <div className="overflow-x-auto overflow-y-hidden pb-6 -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-6 w-max">
                {newsItems.map((item, index) => (
                  <div 
                    key={item.id}
                    onClick={() => openNewsDetail(item.id)}
                    className="w-[380px] flex-shrink-0 bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 group"
                    data-microcms-field={`newsItems.${index}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-gray-600 font-medium" data-microcms-field={`newsItems.${index}.date`}>
                        {item.date}
                      </span>
                      <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-lg ${
                        item.category === 'NEW' ? 'bg-[#FF8C00] text-white' :
                        item.category === 'PRESS' ? 'bg-[#0056b3] text-white' :
                        'bg-gray-200 text-gray-700'
                      }`} data-microcms-field={`newsItems.${index}.category`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 group-hover:text-[#FF8C00] transition-colors font-medium leading-relaxed line-clamp-3 min-h-[60px]" data-microcms-field={`newsItems.${index}.title`}>
                      {item.title}
                    </p>
                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                      <div className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-full group-hover:bg-[#FF8C00] transition-colors">
                        <i className="ri-arrow-right-line text-[#FF8C00] group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              お問い合わせ
            </h2>
            <div className="w-20 sm:w-24 h-1.5 bg-[#FF8C00] mx-auto mb-4 sm:mb-6"></div>
            <p className="text-gray-700 text-sm sm:text-base">
              ご質問やご相談がございましたら、お気軽にお問い合わせください。
            </p>
          </div>
          
          <form onSubmit={handleContactSubmit} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-100" data-readdy-form>
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-bold text-gray-700 mb-2">
                  お名前 <span className="text-[#FF8C00]">*</span>
                </label>
                <input 
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  value={contactFormData.name}
                  onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                  placeholder="山田 太郎"
                />
              </div>
              
              <div>
                <label htmlFor="contact-email" className="block text-sm font-bold text-gray-700 mb-2">
                  メールアドレス <span className="text-[#FF8C00]">*</span>
                </label>
                <input 
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                  placeholder="example@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-bold text-gray-700 mb-2">
                  件名 <span className="text-[#FF8C00]">*</span>
                </label>
                <input 
                  type="text"
                  id="contact-subject"
                  name="subject"
                  required
                  value={contactFormData.subject}
                  onChange={(e) => setContactFormData({...contactFormData, subject: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all text-sm"
                  placeholder="お問い合わせ内容"
                />
              </div>
              
              <div>
                <label htmlFor="contact-message" className="block text-sm font-bold text-gray-700 mb-2">
                  メッセージ <span className="text-[#FF8C00]">*</span>
                </label>
                <textarea 
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  maxLength={500}
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData({...contactFormData, message: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all resize-none text-sm"
                  placeholder="お問い合わせ内容を詳しくご記入ください(500文字以内)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">{contactFormData.message.length}/500文字</p>
              </div>
              
              <Button type="submit" size="lg" className="w-full shadow-lg">
                送信する
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}