# Bookshelf

* Login with your Google account and manage your books. 
* Add a book, label it, put it on shelf, mark it as favorite, mark it as read, put a bookmark by page number, add an image to it, write a short description, long description, mark it as loaned to somebody, delete it, add it on the list to buy it.  




// Keyclock config and run:
docker run -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.0.5 start-dev
