import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../utils/contexts/StoreContext";
import { Link, useOutletContext } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import CartItem from "../components/CartItem";
import toast from "react-hot-toast";
import { toastStyle } from "../utils/toastStyle";

const Cart = () => {
  const { setShowLogin } = useOutletContext();
  const { cartItems, products, removeFromCart, setCartItems } =
    useContext(StoreContext);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const deliveryCost = totalItems === 0 ? 0 : 110;
  const [promoCodeValue, setPromoCodeValue] = useState("");
  const [promoCodeCount, setPromoCodeCount] = useState(0);
  let cartInfo = {};
  const promocode = "kanjus";

  function handlePromoCode() {
    if (promoCodeValue.toLowerCase() !== promocode) {
      toast.error("Invalid promo code", {
        style: toastStyle,
      });
      setPromoCodeValue("");
    } else if (
      promoCodeValue.toLowerCase() === promocode &&
      promoCodeCount === 1
    ) {
      toast.error("Promo code already applied", {
        style: toastStyle,
      });
      setPromoCodeValue("");
    } else if (
      promoCodeValue.toLowerCase() === promocode &&
      promoCodeCount === 0
    ) {
      toast.success("Promo code applied successfully", {
        style: toastStyle,
      });
      setPromoCodeCount(1);
      setTotalPrice(totalPrice - totalPrice * 0.5);
      setPromoCodeValue("");
    }
  }

  function handleCheckout() {
    if (totalItems === 0) {
      toast.error("Your cart is empty", {
        style: toastStyle,
      });
    } else {
      const isAuthenticated = JSON.parse(
        localStorage.getItem("isAuthenticated")
      );
      const user = JSON.parse(localStorage.getItem("user"));

      if (isAuthenticated) {
        cartInfo = {
          products: cartItems,
          totalItems: totalItems,
          subtotal: subtotal,
          deliveryCost: deliveryCost,
          totalPrice: totalPrice,
        };
        setCartItems({});
        localStorage.removeItem("cartItems");
        setPromoCodeCount(0);
        toast.success(`${user.fullName}, Your order has been placed`, {
          style: toastStyle,
        });

        // Send cart info to backend
        fetch("/api/orders/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: JSON.parse(localStorage.getItem("user")).id,
            cartInfo,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        setShowLogin(true);
        toast("Login to continue shopping", {
          icon: "🔒",
          style: toastStyle,
        });
      }
    }
  }

  useEffect(() => {
    try {
      let count = 0;
      Object.values(cartItems).forEach((item) => {
        count += item;
      });
      setTotalItems(count);
    } catch (error) {
      console.log(error);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      const allItemsTotalArrar = Object.keys(cartItems).map((id) => {
        return (
          products.find((product) => product.id == id).price * cartItems[id]
        );
      });
      const total = allItemsTotalArrar.reduce((a, b) => a + b, 0);
      setSubtotal(total);
      setTotalPrice(total + deliveryCost);
    } catch (error) {
      console.log(error);
    }
  }, [cartItems, products, deliveryCost]);

  return (
    <div className="min-h-screen">
      <section>
        <div className="container px-6 pt-6 m-auto">
          <Link
            to="/products"
            className="flex items-center text-xl text-dark hover:text-primary"
          >
            <FaArrowLeft className="inline-block mr-2" />
            <span>Back to Products</span>
          </Link>
        </div>
      </section>

      <section>
        <div className="container px-6 py-10 m-auto">
          <div className="flex justify-center w-full gap-6 max-md:flex-col">
            <main className="flex-1">
              <div className="min-h-full p-6 text-center rounded-lg shadow-md bg-light md:text-left">
                <h3 className="mb-6 text-2xl font-bold">Cart Items</h3>
                <div>
                  {totalItems === 0 ? (
                    <div className="text-lg">Your cart is empty</div>
                  ) : (
                    products.map((item) => {
                      if (cartItems[item.id] > 0) {
                        return (
                          <CartItem
                            key={item.id}
                            product={item}
                            quantity={cartItems[item.id]}
                            removeFromCart={removeFromCart}
                          />
                        );
                      }
                    })
                  )}
                </div>
              </div>
            </main>

            <aside className="flex flex-col flex-1 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-6 text-2xl font-bold">Cart Totals</h3>
                <div className="space-y-2">
                  <div className="text-lg">
                    <p>Subtotal</p>
                    <p className="text-base font-light">Rs. {subtotal}</p>
                  </div>
                  <div className="text-lg">
                    <p>Delivery Cost</p>
                    <p className="text-base font-light">Rs. {deliveryCost}</p>
                  </div>
                  <div className="text-xl font-semibold">
                    <p>{promoCodeCount === 0 ? "Total" : "Discounted Total"}</p>
                    <p className="text-lg font-semibold">Rs. {totalPrice}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 bg-white rounded-lg shadow-md">
                <h3 className="flex-1 mb-6 text-2xl font-bold">Checkout</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCodeValue}
                    className="p-4 text-base rounded-lg text-dark w-full border-2"
                    onChange={(e) => setPromoCodeValue(e.target.value)}
                  />
                  <button
                    className="block w-full px-6 py-3 mx-auto font-semibold text-center rounded-full bg-dark text-light hover:bg-dark/90"
                    onClick={handlePromoCode}
                  >
                    Apply Promo Code
                  </button>
                  <button
                    className="block w-full px-6 py-3 mx-auto font-semibold text-center rounded-full bg-dark text-light hover:bg-dark/90"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cart;
