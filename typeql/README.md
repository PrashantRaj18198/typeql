# Why use typeQL

Below is a sample graphql shema but you don't know what kind of data it returns
is it an `object`, an `array of objects`, etc.

```graphql
query HeroNameAndFriends(
  $hero_id: String!
  $some_other_id: Int
  $another_string: String!
) {
  hero_by_id(id: $hero_id, some_id: $some_other_id, another: $another_string) {
    name
    friends {
      name
    }
  }
}
```

After using typeQL. You get a schema which is more descriptive about the data
that you are going to get from this query.

```graphql
query HeroNameAndFriends(
 $hero_id: String!,
 $some_other_id: Int,
 $another_string: String!
) {
  hero_by_id(id: $hero_id, some_id: $some_other_id, another: $another_string): {
    name: String!
    friends: [{
      name: String!
    }]
  }
}
```

The above will return to

```typescript
export interface IResult {
  hero_by_id: {
    name: string;
    friends: {
      name: string | null;
    }[];
  };
}
export interface IVariables {
  hero_id: string;
  some_other_id: number | null;
  another_string: string;
}
```
