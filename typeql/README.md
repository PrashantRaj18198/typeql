# Why use typeQL

Below is a sample graphql shema but you don't know what kind of data it returns
is it an `object`, an `array of objects`, etc.

```graphql
query HeroNameAndFriends {
  hero {
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
query HeroNameAndFriends {
  hero: {
    name: String!
    friends: [{
      name: String!
    }]
  }
}
```
