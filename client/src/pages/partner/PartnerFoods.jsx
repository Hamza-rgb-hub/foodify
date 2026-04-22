import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import api from "../../utils/api";
import { formatPrice, getImageUrl } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function PartnerFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    // Get partner profile first
    api
      .get("/partners/dashboard")
      .then((r) => {
        const p = r.data.data;
        // We need partner id - fetch from partners
        api.get("/auth/me").then((me) => {
          if (me.data.partner) {
            setPartner(me.data.partner);
            api
              .get(`/food/partner/${me.data.partner._id}`)
              .then((r) => setFoods(r.data.data || []))
              .finally(() => setLoading(false));
          } else setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleAvailable = async (food) => {
    try {
      await api.put(`/food/${food._id}`, { isAvailable: !food.isAvailable });
      setFoods((fs) =>
        fs.map((f) =>
          f._id === food._id ? { ...f, isAvailable: !f.isAvailable } : f,
        ),
      );
      toast.success(`${food.name} ${food.isAvailable ? "hidden" : "shown"}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteFood = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/food/${id}`);
      setFoods((fs) => fs.filter((f) => f._id !== id));
      toast.success("Food item deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            My Food Items
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {foods.length} items in your menu
          </p>
        </div>
        <Link
          to="/partner/foods/add"
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={16} /> Add Item
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your items..."
          className="input pl-10 max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((food, i) => (
              <motion.div
                key={food._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`card overflow-hidden ${!food.isAvailable ? "opacity-60" : ""}`}
              >
                <div className="relative h-36">
                  <img
                    src={getImageUrl(food.images?.[0]?.public_id)}
                    alt={food.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80";
                    }}
                  />
                  {!food.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        Hidden
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {food.name}
                    </h3>
                    <span className="font-bold text-orange-500 text-sm flex-shrink-0">
                      {formatPrice(food.price)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {food.category?.name}
                  </p>
                  <div className="flex items-center gap-1 mt-3">
                    <button
                      onClick={() => toggleAvailable(food)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        food.isAvailable
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {food.isAvailable ? (
                        <>
                          <EyeOff size={12} /> Hide
                        </>
                      ) : (
                        <>
                          <Eye size={12} /> Show
                        </>
                      )}
                    </button>
                    <Link
                      to={`/partner/foods/edit/${food._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => deleteFood(food._id, food.name)}
                      className="flex items-center justify-center p-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍽️</p>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {search ? "No items match your search" : "No food items yet"}
          </h3>
          {!search && (
            <Link
              to="/partner/foods/add"
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus size={15} /> Add First Item
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
