import React, { useEffect, useState, useContext } from "react";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Icon, Typography } from "@mui/material";
import Grid from "@material-ui/core/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ProductCard from "./ProductCard";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import Store, { IdContext } from "../BuyNow/Store";
import { Divider } from "@mui/material";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginTop: 15,
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  image: {
    height: 150,
    width: 150,
    objectFit: "contain",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
  },
}));

const ProductDesc = () => {
  const { productId } = useParams();
  const { id, setId } = useContext(IdContext);
  const [product, setProduct] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryProducts, setcategoryProducts] = useState([]);
  const token = Cookies.get("token");
  const userId = Cookies.get("userId");
  const classes = useStyles();
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState();
  const [ratings, setRatings] = useState(3);
  const [userRating, setUserRating] = useState(1);
  const [userReview, setUserReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isUserReview, setIsUserReview] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const buyNow = (id) => {
    console.log(token, userId);
    setId(id);
    navigate("/buyNow/" + id);
  };
  const addToCart = (id) => {
    console.log(token, userId);
    apiClient
      .post(urls.cart.create.replace("{id}", id), null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          console.log(response);
          toast("Item Added to Cart Successfully", { type: "success" });
        } else {
          toast("Failed to Add Item to Cart", { type: "success" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const submitReview = (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    const id = new URL(window.location.href).pathname.split("/")[2];
    if (token) {
      apiClient
        .post(
          urls.review.create.replace("{id}", productId),
          {
            rating: userRating,
            review: userReview,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            console.log(response);
            setRatings(3);
            setUserReview("");
            setIsUserReview(true);
            toast("Review Added Successfully", { type: "success" });
          } else {
            toast("Failed to Add Review", { type: "success" });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      toast("Please Login to Add Review", { type: "error" });
    }
  };

  const deleteReview = () => {
    const token = Cookies.get("token");
    const id = new URL(window.location.href).pathname.split("/")[2];
    apiClient
      .delete(urls.review.delete.replace("{id}", id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          console.log(response);
          setUserReview("");
          setIsUserReview(false);
          toast("Review Deleted Successfully", { type: "success" });
        } else {
          toast("Failed to Delete Review", { type: "success" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    const id = new URL(window.location.href).pathname.split("/")[2];
    console.log(id);

    apiClient
      .get(urls.product.get.replace("{id}", id), {
        headers: {
          Authorization: `Bearer ${token}`,
          userId: userId,
        },
      })
      .then((response) => {
        console.log(response);
        setProduct(response.data[0]);
        setCategoryName(response.data[1]);
        setcategoryProducts(response.data[2]);
        setMainImage(response.data[0].images[0]);
        setRatings(response.data[0].ratings);
        setUserReview(response.data[0].userReview);
        setUserRating(response.data[0].userRating);
        setReviews(response.data[0].reviews);
        if (response.data[0].userReview != null) {
          setIsUserReview(true);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, [id, isUserReview]);

  useEffect(() => {
    const handlePopstate = () => {
      const previousProductId = localStorage.getItem("previousProductId");
      if (previousProductId) {
        setId(previousProductId); // Set the previous product ID
        localStorage.removeItem("previousProductId");
      }
    };

    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("previousProductId", productId); // Store the current product ID
  }, [productId]);

  return (
    <Grid container>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "30px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid
            item
            lg={12}
            container
            style={{ marginTop: "50px", marginBottom: "50px" }}
          >
            <Grid
              item
              lg={5}
              spacing={2}
              display={"flex"}
              justifyContent="center"
              style={{ margin: "16px", flexWrap: "wrap" }}
            >
              <Grid item lg={12} style={{ marginBottom: "20px" }}>
                <CardMedia
                  component={"img"}
                  image={mainImage}
                  title="Product Image"
                  style={{
                    objectFit: "contain",
                    height: "500px",
                    width: "600px",
                  }}
                />
              </Grid>
              <Grid item lg={12}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  color="secondary"
                  style={{
                    width: 180,
                    marginLeft: "78px",
                    marginRight: "50px",
                    backgroundColor: "#f0c14b",
                  }}
                  onClick={() => {
                    if (token) {
                      addToCart(productId);
                    } else {
                      toast.info("Please log in to add to cart");
                    }
                  }}
                >
                  Add To Cart
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  color="secondary"
                  style={{
                    width: 180,
                    marginLeft: "30px",
                    backgroundColor: "#f0c14b",
                  }}
                  onClick={() => {
                    if (token) {
                      buyNow(productId);
                    } else {
                      toast.info("Please log in to buy");
                    }
                  }}
                >
                  Buy Now
                </Button>
              </Grid>
            </Grid>

            <Grid item container lg={2} direction="column" spacing={2}>
              {product["images"]?.map((image) => (
                <Grid item>
                  <CardMedia
                    component={"img"}
                    className={classes.image}
                    image={image}
                    title="Product Image"
                    style={{
                      objectFit: "contain",
                      height: "120px",
                      width: "120px",
                    }}
                    onClick={() => setMainImage(image)}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid item lg={4} className={classes.details}>
              <Typography variant="h3" style={{ marginBottom: "20px" }}>
                {product["name"]}
              </Typography>
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "baseline",
                }}
              >
                <Typography variant="h5" style={{ marginRight: "10px" }}>
                  ₹ {product["newPrice"]}
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    marginRight: "10px",
                    textDecoration: "line-through",
                  }}
                >
                  ₹ {product["oldPrice"]}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  // fontWeight="bold"
                  style={{ color: "red" }}
                >
                  {Math.floor(
                    ((product["oldPrice"] - product["newPrice"]) /
                      product["oldPrice"]) *
                      100
                  )}
                  % off
                </Typography>
              </div>

              <Typography
                variant="body1"
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Cash on Delivery Available{" "}
                <CheckCircleIcon
                  style={{ marginLeft: "5px" }}
                  color="success"
                />
              </Typography>
              <Rating
                name="text-feedback"
                value={ratings}
                readOnly
                precision={0.5}
                emptyIcon={
                  <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                }
              />
              <Typography variant="h6" style={{ marginBottom: "10px" }}>
                Description
              </Typography>
              <Typography variant="body1">{product["description"]}</Typography>
            </Grid>
          </Grid>
          <Grid
            item
            lg={12}
            style={{ marginLeft: "75px", marginRight: "100px" }}
          >
            <Divider />
          </Grid>

          <Grid
            item
            lg={12}
            container
            spacing={3}
            marginTop={"20px"}
            style={{
              marginLeft: "75px",
              marginRight: "100px",
              marginTop: "10px",
              padding: "24px",
            }}
          >
            <Grid item lg={12}>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Typography variant="h5">Ratings and Reviews</Typography>
                <Typography variant="h6">Your Ratings</Typography>
                {token ? (
                  <div>
                    {isUserReview ? (
                      <>
                        <Rating
                          style={{
                            marginTop: "10px",
                          }}
                          value={userRating}
                          readOnly
                          name="size-medium"
                          defaultValue={2}
                        />
                        <Typography
                          variant="body1"
                          style={{ marginTop: "10px" }}
                        >
                          {userReview}
                        </Typography>
                        <IconButton aria-label="delete" onClick={deleteReview}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton aria-label="edit">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Rating
                          style={{
                            marginTop: "10px",
                          }}
                          value={userRating}
                          onChange={(e) => {
                            setUserRating(e.target.value);
                          }}
                          name="size-medium"
                          defaultValue={2}
                        />
                        <TextField
                          id="writeReview"
                          label="Write a review"
                          variant="outlined"
                          value={userReview}
                          style={{
                            marginTop: "30px",
                            marginBottom: "20px",
                            width: "100%",
                          }}
                          InputProps={{
                            style: { height: "200px", margin: "dense" },
                          }}
                          onChange={(e) => {
                            setUserReview(e.target.value);
                          }}
                          multiline
                        />
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={submitReview}
                          sx={{ mt: 3, mb: 2, width: "150px" }}
                        >
                          Submit Review
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <Typography variant="body1" style={{ marginTop: "10px" }}>
                    Please log in to write a review
                  </Typography>
                )}

                <Typography variant="h6" marginTop="10px">
                  Customer Reviews
                </Typography>
                {reviews.map((review) => (
                  <div
                    sx={{
                      paddingLeft: "10px",
                      display: "flex",
                      alignItems: "baseline",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="body1" style={{ marginTop: "10px" }}>
                      {review[0]} {review[1]}
                    </Typography>

                    <Rating
                      style={{
                        marginTop: "10px",
                        marginRight: "10px",
                      }}
                      value={review[2]}
                      name="size-small"
                      size="small"
                      readOnly
                    />
                    <Typography
                      variant="body2"
                      style={{ marginTop: "10px", display: "inline-block" }}
                    >
                      {review[3]}
                    </Typography>
                  </div>
                ))}
              </Box>
            </Grid>
            <Grid item lg={12}>
              <Divider />
            </Grid>
            <Grid item lg={12}>
              <Typography
                variant="h5"
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  padding: "10px",
                }}
              >
                {categoryName}
              </Typography>
            </Grid>
            {categoryProducts.map((item) => (
              <Grid
                item
                key={item.number}
                onClick={() => {
                  setId(item.productId);
                }}
              >
                <ProductCard
                  productId={item.productId}
                  category={item.category}
                  itemName={item.name}
                  newPrice={item.newPrice}
                  oldPrice={item.oldPrice}
                  image={item.image}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ProductDesc;
