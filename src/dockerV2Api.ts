export interface Image {
    architecture: string;
    features: string;
    variant?: any;
    digest: string;
    os: string;
    os_features: string;
    os_version?: any;
    size: number;
    status: string;
    last_pulled: Date;
    last_pushed: Date;
}

export interface Result {
    creator: number;
    id: number;
    image_id?: any;
    images: Image[];
    last_updated: Date;
    last_updater: number;
    last_updater_username: string;
    name: string;
    repository: number;
    full_size: number;
    v2: boolean;
    tag_status: string;
    tag_last_pulled: Date;
    tag_last_pushed: Date;
}

export interface Images {
    count: number;
    next?: any;
    previous?: any;
    results: Result[];
}