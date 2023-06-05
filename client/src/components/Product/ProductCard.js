import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function MediaCard({ itemName, category, price, image }) {
  return (
    <Card sx={{ width: 235 }}>
      <CardMedia
        sx={{
          height: 150,
          // paddingTop: "100%", // 1:1 Aspect Ratio
          backgroundSize: "contain",
        }}
        image={image}
        title="Charger"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {itemName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ₹{price}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {category}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button size="small">Buy Now</Button>
        <Button size="small">Add to Cart</Button>
      </CardActions>
    </Card>
  );
}
