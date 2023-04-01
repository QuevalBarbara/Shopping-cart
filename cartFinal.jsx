// sumulate getting products from DataBase
const products = [
  { name: 'Apple ', country: 'Italy', cost: 3, instock: 10 },
  { name: 'Orange ', country: 'Spain', cost: 4, instock: 3 },
  { name: 'Bean ', country: 'USA', cost: 2, instock: 5 },
  { name: 'Cabbage ', country: 'USA', cost: 1, instock: 8 },
  { name: 'Tomato ', country: 'Mexico', cost: 2, instock: 11 },
];

//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if (item[0].instock == 0) return;
    item[0].instock = item[0].instock - 1;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
  };
  const deleteCartItem = (delIndex) => {
    // this is the index in the cart not in the Product List

    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => delIndex == index);
    let newItems = items.map((item, index) => {
      if (item.name == target[0].name) item.instock = item.instock + 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049;
    let uhit = "http://picsum.photos/" + n;
    
    return (
      <li key={index}> 
      <Card key={index} style={{ width: '18rem' }}>
        <div style={{ width: '100px', height: '100px', overflow: 'hidden', borderRadius: '50%', margin: '0 auto' }}>
          <img src={uhit} alt={`img-${n}`} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
        <Card.Body>
          <Card.Title>{item.name} : ${item.cost}</Card.Title>
          <Card.Text>
            Stock={item.instock}
          </Card.Text>
          <Button variant="primary" name={item.name} type="submit" onClick={addToCart}>Add to cart</Button>
        </Card.Body>
      </Card>
    </li>
    );
  });

  let groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = { ...item, quantity: 1 };
    } else {
      acc[item.name].quantity++;
    }
    return acc;
  }, {});

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

let cartList = Object.values(groupedCart).map((item, index) => {
  const showDetails = selectedItemIndex === index;

  return (
    <Card key={index}>
      <Card.Header className="d-flex">
        <div className="flex-grow-1">
          {item.name} {item.quantity > 1 && `: ${item.quantity}`}
        </div>
        <div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => deleteCartItem(index)}
            eventKey={1 + index}
            className="ml-auto"
          >
            Delete item
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setSelectedItemIndex(index)}
            className="ml-2"
          >
            See details
          </Button>
        </div>
      </Card.Header>
      {showDetails && (
        <Card.Body>
          $ {item.cost} from {item.country}
        </Card.Body>
      )}
    </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let cartItems = {};
  
    // Count the number of times each item appears in the cart
    for (let item of cart) {
      if (cartItems[item.name]) {
        cartItems[item.name]++;
      } else {
        cartItems[item.name] = 1;
      }
    }
  
    // Create a list of items with their counts
    let final = Object.keys(cartItems).map((itemName, index) => {
      let count = cartItems[itemName];
      return (
        <div key={index} index={index}>
          {itemName} : {count}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    //cart.map((item, index) => deleteCartItem(index));
    return newTotal;
  };
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      return { name, country, cost, instock };
    });
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
