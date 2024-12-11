export type RSSSource = {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  last_fetch_at: string | null;
};

export type RSSEntry = {
  title?: { _text?: string };
  description?: { _text?: string };
  content?: { _text?: string };
  'content:encoded'?: { _text?: string };
  summary?: { _text?: string };
};