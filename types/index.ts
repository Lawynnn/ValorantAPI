export interface APICacheProvider<T> {
    fetch: () => Promise<T>;
}

export interface APICache {
    ranks: APICacheProvider<APICompetitiveTier[]>;
    maps: APICacheProvider<APIMap[]>;
}

export interface APIUser {
    country: string;
    puuid: string;
    isEmailVerified: () => boolean;
    isPhoneVerified: () => boolean;
    isFullyVerified: () => boolean;
    isEnabled: () => boolean;
    getRegion: () => string;
    getShard: () => string;
    isInParty: () => Promise<boolean>;
    store: () => APIStore;
    match: () => APIMatch;
    cache: APICache;
    clientVersion: string;
    username: string;
    gameName: string;
    tagLine: string;
    createdAt: Date;
    readonly entitlementsToken: string;
    readonly accessToken: string;
    getParty: () => Promise<APIParty | null>;
}

export interface APIMember {
    puuid: string;
    gameName: string;
    tagLine: string;
    cardId: string;
    region: string;
    level: number;
}

export interface APIPartyMemberIdentity {
    cardId: string;
    titleId: string;
    level: number;
    borderId: string;
    incognito: boolean;
    incognitoLevel: boolean;
}

export interface APICompetitiveTier {
    tier: number;
    name: string;
}

export interface APIMap {
    puuid: string;
    name: string;
    coordinates: string;
    icon: string;
    path: string;
    url: string;
}

export interface APIPartyMember {
    puuid: string;
    getRank: () => APICompetitiveTier | null;
    platform: string;
    identity: APIPartyMemberIdentity;
    member: () => Promise<APIMember>;
    isOwner: () => boolean;
    isReady: () => boolean;
    kick: () => Promise<boolean>;
}

export interface APIPartyInvite {
    puuid: string;
    expiresIn: number;
    createdAt: Date;
    invitedBy: string;
}

export interface APIPartyMatchmaking {
    id: string;
    prefferedServers: string[];
    penalty: number;
}

export enum APIQueueID {
    Competitive = "competitive",
    Deathmatch = "deathmatch",
    SpikeRush = "spikerush",
    Unrated = "unrated",
    Swiftplay = "swiftplay",
    Escalation = "ggteam",
    TeamDeathmatch = "hurm",
}

export enum APIPartyAccessibility {
    Open = "OPEN",
    Closed = "CLOSED",
}

export interface APIParty {
    uuid: string;
    voiceId: string;
    members: APIPartyMember[];
    invites: APIPartyInvite[];
    matchmaking: APIPartyMatchmaking;
    isOpen: () => boolean;
    setOpen: () => Promise<void>;
    setClosed: () => Promise<void>;
    setQueue: (queueId: APIQueueID | string) => Promise<void>;
}

export interface APIWallet {
    RadianitePoints: number;
    ValorantPoints: number;
    KingdomCredits: number;
    FreeAgents: number;
}

export interface APIItem<T> {
    puuid: string;
}

export interface APIAgent extends APIItem<APIItemType.Agents> {
    name: string;
    description: string;
    icon: string;
    path: string;
}

export interface APIStore {
    getOwnedItems: (itemTypeId: APIItemType | string) => Promise<APIItem<APIItemType>[]>;
    getWallet: () => Promise<APIWallet>;
}

export interface APIMatchHistoryOptions {
    startIndex?: number | null;
    endIndex?: number | null;
    queueId?: APIQueueID | string;
}

export interface APIMatchDetailsLength {
    gameLength: Date;
    gameStart: Date;
}

export interface APIMatchPlayer {
    puuid: string;
    gameName: string;
    tagLine: string;
    platform: string;
    team: APIMatchTeam;
    character: APIAgent | undefined;
    partyId: string;
    isObserver: () => boolean;
    rank: APICompetitiveTier | undefined;
}

export interface APIMatchDetails {
    id: string;
    map: APIMap | undefined;
    server: string;
    time: APIMatchDetailsLength;
    isCustomGame: () => boolean;
    ranked: boolean;
    isMatchmaking: () => boolean;
    state: APIMatchCompletionState;
    queueId: APIQueueID | string;
    penalties: { [puuid: string]: number };
    platform: string;
    players: APIMatchPlayer[];
}

export interface APIMatchHistoryMatch {
    id: string;
    queueId: APIQueueID | string;
    startedAt: Date;
    getDetails: () => Promise<APIMatchDetails | null>;
}

export interface APIMatchHistory {
    total: number;
    matches: APIMatchHistoryMatch[];
    getLastMatch: () => APIMatchHistoryMatch | null;
    getFirstMatch: () => APIMatchHistoryMatch | null;
}

export interface APIMatchCurrent {

}

export interface APIMatch {
    history: (options?: APIMatchHistoryOptions) => Promise<APIMatchHistory | null>;
    current: () => Promise<APIMatchCurrent | null>;
}

export enum APIMatchTeam {
    Red = "Red",
    Blue = "Blue",
}

export enum APIMatchCompletionState {
    Completed = "Completed",
    Surrendered = "Surrendered",
    Drawed = "VoteDraw",
    Abandoned = "",
}

export enum APIRegion {
    NA = "na",
    EU = "eu",
    AP = "ap",
    KR = "kr",
    BR = "br",
    LATAM = "latam",
}

export enum APIShard {
    NA = "na",
    EU = "eu",
    AP = "ap",
    KR = "kr",
    PBE = "pbe",
}

export enum APIItemType {
    Agents = "01bb38e1-da47-4e6a-9b3d-945fe4655707",
    Contracts = "f85cb6f7-33e5-4dc8-b609-ec7212301948",
    Sprays = "d5f120f8-ff8c-4aac-92ea-f2b5acbe9475",
    GunBuddies = "dd3bf334-87f3-40bd-b043-682a57a8dc3a",
    Cards = "3f296c07-64c3-494c-923b-fe692a4fa1bd",
    Skins = "e7c63390-eda7-46e0-bb7a-a6abdacd2433",
    SkinVariants = "3ad1b2b2-acdb-4524-852f-954a76ddae0a",
    Titles = "de7caa6b-adf7-4588-bbd1-143831e786c6",
}

export enum APIWalletType {
    ValorantPoints = "85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741",
    KingdomCredits = "85ca954a-41f2-ce94-9b45-8ca3dd39a00d",
    FreeAgents = "f08d4ae3-939c-4576-ab26-09ce1f23bb37",
    RadianitePoints = "e59aa87c-4cbf-517a-5983-6e81511be9b7",
}