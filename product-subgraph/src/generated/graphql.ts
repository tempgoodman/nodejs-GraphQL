export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  decreaseProductStock?: Maybe<Product>;
  resetProduct?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationDecreaseProductStockArgs = {
  id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  transactionId?: InputMaybe<Scalars['ID']['input']>;
};

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
  leaseRemainQty: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  stock: Scalars['Int']['output'];
};

export type ProductPage = {
  __typename?: 'ProductPage';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Product>;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  getProduct?: Maybe<Product>;
  listProducts: ProductPage;
};


export type QueryGetProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryListProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};
