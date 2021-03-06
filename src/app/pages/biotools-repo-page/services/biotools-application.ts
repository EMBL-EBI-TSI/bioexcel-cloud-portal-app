export interface BiotoolsApplicationTopic {
  uri: string;
  term: string;
}

export interface BiotoolsApplicationDownload {
  url: string;
  note: string;
  type: string;
}

export interface BiotoolsApplication {
  id: string;
  name: string;
  versionId: string;
  homepage: string;
  description: string;
  topic: BiotoolsApplicationTopic[];
  toolType: string[];
  download: BiotoolsApplicationDownload[];
  icons: BioToolsApplicationIcons;
}

export interface BiotoolsApplicationPage {
  count: number;
  previous: string;
  next: string;
  list: BiotoolsApplication[];
}

export interface BioToolsApplicationIcons {
   cloud: boolean;
   binder: boolean;
   globe: boolean;
   window: boolean;
   book: boolean;
}
