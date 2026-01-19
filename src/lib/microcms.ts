import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: 'softskills',
  apiKey: 'fw9vKuYzrP2njkLIKPAwyhwiIEbJPd5LSqQu',
});

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: string;
  category: string;
  image: {
    url: string;
  };
  detailDescription?: string;
  schedule?: string;
  target?: string;
  capacity?: string;
  organizer?: string;
  contact?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  category: string;
  title: string;
  link: string;
  content?: string;
  summary?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: {
    url: string;
  };
  type: 'sponsor' | 'partner';
}

export interface PastEvent {
  id: string;
  title: string;
  date: string;
  image: {
    url: string;
  };
  description?: string;
  detailDescription?: string;
  participants?: string;
  location?: string;
  gallery?: Array<{
    url: string;
  }>;
}

export const getUpcomingEvents = async () => {
  try {
    const response = await client.get({
      endpoint: 'upcomingevents',
    });
    return response.contents as Event[];
  } catch (error) {
    // 404エラーの場合は静かに空配列を返す（APIがまだ作成されていない）
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    console.error('Failed to fetch upcoming events:', error);
    return [];
  }
};

export const getUpcomingEventById = async (id: string) => {
  try {
    const response = await client.get({
      endpoint: 'upcomingevents',
      contentId: id,
    });
    return response as Event;
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return null;
  }
};

export const getPickupEvent = async () => {
  try {
    const response = await client.get({
      endpoint: 'pickupevents',
    });
    
    if (!response.contents || response.contents.length === 0) {
      return [];
    }
    
    // microCMSから取得したデータをEvent型に変換
    // 画像フィールドのフィールドIDが異なる可能性に対応
    const events = response.contents.map((item: any) => {
      
      // 画像フィールドのフィールドIDが異なる可能性に対応
      // image（標準）, photo（旧フィールドID）, mainImage, thumbnail, 画像 など様々な可能性をチェック
      let imageData = item.image;
      if (!imageData) {
        imageData = item.photo || item.mainImage || item.thumbnail || item['画像'] || null;
      }
      
      // 画像データが存在する場合、urlプロパティがあるか確認
      if (imageData && typeof imageData === 'object' && imageData.url) {
        // 正常な画像データ
      } else if (imageData && typeof imageData === 'string') {
        // 文字列の場合は、urlプロパティを持つオブジェクトに変換
        imageData = { url: imageData };
      } else {
        // 画像データが存在しない場合はnullに設定
        imageData = null;
        console.warn('⚠️ PickUpイベントに画像が設定されていません:', item.id);
      }
      
      return {
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        date: item.date || item['開催日程'] || '',
        location: item.location || item['場所'] || '',
        price: item.price || item['参加費'] || '',
        category: item.category || item['カテゴリー'] || '',
        image: imageData || { url: '' }, // 画像がない場合は空のurlを設定
        detailDescription: item.detailDescription || item['詳細説明'] || '',
        schedule: item.schedule || '',
        target: item.target || item['対象者'] || '',
        capacity: item.capacity || item['定員'] || '',
        organizer: item.organizer || item['主催'] || '',
        contact: item.contact || item['お問い合わせ先'] || '',
      } as Event;
    });
    
    return events;
  } catch (error) {
    // 404エラーの場合は静かに空配列を返す（APIがまだ作成されていない）
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    console.error('Failed to fetch pickup event:', error);
    return [];
  }
};

export const getPastEvents = async () => {
  try {
    const response = await client.get({
      endpoint: 'pastevents',
    });
    return response.contents as PastEvent[];
  } catch (error) {
    // 404エラーの場合は静かに空配列を返す（APIがまだ作成されていない）
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    console.error('Failed to fetch past events:', error);
    return [];
  }
};

export const getPastEventById = async (id: string) => {
  try {
    const response = await client.get({
      endpoint: 'pastevents',
      contentId: id,
    });
    return response as PastEvent;
  } catch (error) {
    console.error('Failed to fetch past event:', error);
    return null;
  }
};

export const getNewsItems = async () => {
  try {
    const response = await client.get({
      endpoint: 'newsitems',
    });
    return response.contents as NewsItem[];
  } catch (error) {
    // 404エラーの場合は静かに空配列を返す（APIがまだ作成されていない）
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    console.error('Failed to fetch news items:', error);
    return [];
  }
};

export const getNewsItemById = async (id: string) => {
  try {
    const response = await client.get({
      endpoint: 'newsitems',
      contentId: id,
    });
    return response as NewsItem;
  } catch (error) {
    console.error('Failed to fetch news item:', error);
    return null;
  }
};

export const getPartners = async () => {
  try {
    const response = await client.get({
      endpoint: 'partners',
    });
    return response.contents as Partner[];
  } catch (error) {
    // 404エラーの場合は静かに空配列を返す（APIがまだ作成されていない）
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    console.error('Failed to fetch partners:', error);
    return [];
  }
};
