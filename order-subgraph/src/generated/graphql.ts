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
  createOrder?: Maybe<Order>;
  resetOrders?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationCreateOrderArgs = {
  items: Array<OrderItemInput>;
};

export type Order = {
  __typename?: 'Order';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItem>;
  status: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  userId: Scalars['String']['output'];
};

export type OrderItem = {
  __typename?: 'OrderItem';
  product?: Maybe<Product>;
  productId: Scalars['ID']['output'];
  purchasePrice: Scalars['Float']['output'];
  quantity: Scalars['Int']['output'];
};

export type OrderItemInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  getOrders: Array<Order>;
};
