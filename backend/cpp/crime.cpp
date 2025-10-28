#include <iostream>
#include <string>
#include <fstream>

using namespace std;
int main(int argc, char* argv[]) {
    // Get arguments from command line
    std::string type = argv[1];   // DFS, BFS, DISPLAY
    std::string region = argv[2]; // region name

    // Temporary test output
    std::cout << "Running " << type << " for " << region << std::endl;

    ifstream input("crimeData.json");
    if (!input) {
        std::cerr << "Unable to open file crimeData.json";
        return 1;
    }
    string line;
    while(getline(input, line)) {
        std::cout << line << std::endl;
    }
}
