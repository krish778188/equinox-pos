#include "json.hpp"
#include <iostream>
#include <vector>
#include <memory>
#include <string>

using json = nlohmann::json;

// Abstract Base Class
class Product {
protected:
    std::string id;
    std::string name;
    double price;
    int quantity;

public:
    Product(std::string id, std::string name, double price, int quantity)
        : id(std::move(id)), name(std::move(name)), price(price), quantity(quantity) {}
        
    virtual ~Product() = default;

    virtual double calculateTax() const = 0;

    double getSubtotal() const {
        return price * quantity;
    }
    
    double getTotal() const {
        return getSubtotal() + calculateTax();
    }
    
    int getQuantity() const { return quantity; }
    std::string getId() const { return id; }
    std::string getName() const { return name; }
    double getPrice() const { return price; }
};

class Perishable : public Product {
public:
    Perishable(std::string id, std::string name, double price, int quantity)
        : Product(std::move(id), std::move(name), price, quantity) {}

    double calculateTax() const override {
        return getSubtotal() * 0.02; // 2%
    }
};

class Electronic : public Product {
public:
    Electronic(std::string id, std::string name, double price, int quantity)
        : Product(std::move(id), std::move(name), price, quantity) {}

    double calculateTax() const override {
        return getSubtotal() * 0.10; // 10%
    }
};

int main() {
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line;
    }
    
    if (input.empty()) {
        std::cerr << "Empty input" << std::endl;
        return 1;
    }
    
    try {
        auto req = json::parse(input);
        if (!req.contains("items")) {
            std::cerr << "Missing items" << std::endl;
            return 1;
        }

        std::vector<std::unique_ptr<Product>> cartItems;
        
        for (const auto& item : req["items"]) {
            std::string id = item["id"].get<std::string>();
            std::string name = item["name"].get<std::string>();
            std::string category = "";
            if (item.contains("category")) {
                category = item["category"].get<std::string>();
            }
            double price = item["price"].get<double>();
            int quantity = item["quantity"].get<int>();
            
            if (category == "electronics") {
                cartItems.push_back(std::unique_ptr<Electronic>(new Electronic(id, name, price, quantity)));
            } else {
                cartItems.push_back(std::unique_ptr<Perishable>(new Perishable(id, name, price, quantity)));
            }
        }

        double grandSubtotal = 0.0;
        double grandTax = 0.0;
        double grandTotal = 0.0;

        json receiptItems = json::array();

        for (const auto& product : cartItems) {
            grandSubtotal += product->getSubtotal();
            grandTax += product->calculateTax();
            grandTotal += product->getTotal();
            
            json receiptItem;
            receiptItem["id"] = product->getId();
            receiptItem["name"] = product->getName();
            receiptItem["quantity"] = product->getQuantity();
            receiptItem["price"] = product->getPrice();
            receiptItem["subtotal"] = product->getSubtotal();
            receiptItem["tax"] = product->calculateTax();
            receiptItem["total"] = product->getTotal();
            
            receiptItems.push_back(receiptItem);
        }

        json responseJson;
        responseJson["status"] = "success";
        responseJson["receipt"]["items"] = receiptItems;
        responseJson["receipt"]["subtotal"] = grandSubtotal;
        responseJson["receipt"]["tax"] = grandTax;

        double discountAmount = 0.0;
        std::string discountName = "";
        
        if (req.contains("discount") && !req["discount"].is_null()) {
            auto d = req["discount"];
            std::string type = d["type"].get<std::string>();
            double value = d["value"].get<double>();
            
            if (d.contains("name")) {
                discountName = d["name"].get<std::string>();
            }
            
            if (type == "PERCENT") {
                discountAmount = grandSubtotal * (value / 100.0);
            } else if (type == "FLAT_THRESHOLD") {
                double threshold = d["threshold"].get<double>();
                if (grandSubtotal >= threshold) {
                    discountAmount = value;
                }
            } else if (type == "PERCENT_THRESHOLD") {
                double threshold = d["threshold"].get<double>();
                if (grandSubtotal >= threshold) {
                    discountAmount = grandSubtotal * (value / 100.0);
                }
            } else if (type == "SPECIFIC_ITEM_PERCENT" || type == "SPECIFIC_ITEM_FLAT") {
                std::string targetProductId = "";
                if (d.contains("product_id") && !d["product_id"].is_null()) {
                    targetProductId = d["product_id"].get<std::string>();
                }
                
                for (const auto& product : cartItems) {
                    if (product->getId() == targetProductId) {
                        if (type == "SPECIFIC_ITEM_PERCENT") {
                            discountAmount += product->getSubtotal() * (value / 100.0);
                        } else {
                            // Flat off per quantity
                            discountAmount += (value * product->getQuantity());
                        }
                    }
                }
            }
        }
        
        grandTotal = grandSubtotal + grandTax - discountAmount;
        if (grandTotal < 0) grandTotal = 0;

        responseJson["receipt"]["discount_amount"] = discountAmount;
        responseJson["receipt"]["discount_name"] = discountName;
        responseJson["receipt"]["grand_total"] = grandTotal;

        std::cout << responseJson.dump(4) << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error parsing JSON: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
