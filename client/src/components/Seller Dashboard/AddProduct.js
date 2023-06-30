import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import apiClient from "../../apis/api-client";
import urls from "../../apis/urls";
import { useNavigate } from "react-router-dom";
import wallpaper from "../../images/wallpaper.jpg";
import bcrypt from "bcryptjs";
import Cookies from "js-cookie";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const theme = createTheme();

export default function AddProduct() {
  const navigate = new useNavigate();

  const [categories, setCategories] = useState([]);
  const [sellItem, setSellItem] = useState(1);

  const [name, setName] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [discount, setDiscount] = useState("");

  const [images, setImages] = useState([]);
  const [isButtonMoved, setIsButtonMoved] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImageUpload = (event) => {
    const fileList = event.target.files;
    const newImages = [];

    for (let i = 0; i < fileList.length && images.length < 10; i++) {
      const file = fileList[i];
      const reader = new FileReader();

      reader.onload = () => {
        newImages.push(reader.result);

        if (i === fileList.length - 1 || newImages.length === 10) {
          setImages([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  useEffect(() => {
    const token = Cookies.get("token");
    console.log(token);

    apiClient
      .get(urls.category.get)
      .then((response) => {
        console.log(response.data.categories);
        setCategories(response.data.categories);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [isSuccess]);

  useEffect(() => {
    if (categories.length > 0) {
      setSellItem(categories[0].id);
    }
  }, [categories]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    console.log(token);
    if (images.length === 0) {
      toast.error("Please add at least 1 image");
      return;
    }
    const prevCategory = sellItem;
    apiClient
      .post(
        urls.sellerProducts.add,
        {
          itemName: name,
          oldPrice: oldPrice,
          newPrice: newPrice,
          description: description,
          stock: stock,
          discount: discount,
          images: images,
          categoryId: sellItem,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        toast.success("Product Added Successfully");
        setImages([]);
        setName("");
        setOldPrice("");
        setNewPrice("");
        setDescription("");
        setStock("");
        setDiscount("");
        setSellItem(prevCategory);
        setIsSuccess(!isSuccess);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Product Not Added");
      });
    // navigate("/seller-dashboard");
  };

  return (
    <ThemeProvider theme={theme}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: "bold",
          color: "#3f51b5",
          marginBottom: "20px",
          // marginLeft: "80px",
          marginTop: "80px",
        }}
      >
        Add Product
      </Typography>

      <Grid
        container
        sx={{
          padding: "0px 0px 0px 90px",
        }}
      >
        <Grid item lg={5}>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Add Product Images
          </Typography>
          <Typography component="div" variant="body1">
            Max 10 images can be uploaded for a product
          </Typography>
          <Grid container spacing={2} paddingTop={"20px"}>
            {images.map((image, index) => (
              <Grid
                item
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  style={{
                    width: "125px",
                    height: "100px",
                    objectFit: "contain",
                    marginBottom: "10px",
                  }}
                />
                <IconButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleImageDelete(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            ))}
            {images.length < 10 && (
              <Grid item>
                <input
                  accept="image/*"
                  id="image-upload"
                  type="file"
                  style={{ display: "none", height: "100px" }}
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="primary"
                    component="span"
                    sx={{
                      height: "100px",
                      width: "150px",
                      border: "1px solid black",
                      ...(isButtonMoved && { marginLeft: "auto" }),
                    }}
                  >
                    +
                  </Button>
                </label>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item>
          <Container component="main" maxWidth="xs">
            <Box
              sx={{
                width: "780px",
                display: "flex",
                flexDirection: "column",
                // paddingTop: "50px",
                backgroundColor: "white",
                alignItems: "center",
              }}
            >
              <Typography component="h1" variant="h5" fontWeight="bold">
                Add New Product
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleAddProduct}
                sx={{ mt: 3, width: "100%" }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth>
                        <InputLabel id="sellItem">Category</InputLabel>
                        <Select
                          labelId="sellItem"
                          id="sellItem"
                          value={sellItem}
                          label="Category"
                          onChange={(e) => {
                            setSellItem(e.target.value);
                          }}
                        >
                          {categories?.map((category) => (
                            <MenuItem value={category.id} key={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      id="oldPrice"
                      label="Old Price"
                      name="oldPrice"
                      autoComplete="oldPrice"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      id="newPrice"
                      label="New Price"
                      name="newPrice"
                      autoComplete="newPrice"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      id="stock"
                      label="Stock"
                      name="stock"
                      autoComplete="stock"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="discription"
                      label="Discription"
                      name="discription"
                      autoComplete="discription"
                      value={description}
                      InputProps={{
                        style: { height: "200px", margin: "dense" },
                      }}
                      multiline
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Add Product
                </Button>
              </Box>
            </Box>
          </Container>
        </Grid>
      </Grid>
      <ToastContainer />
    </ThemeProvider>
  );
}
