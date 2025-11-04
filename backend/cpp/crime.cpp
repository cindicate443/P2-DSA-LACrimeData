
#include "tree.h"

int main(int argc, char* argv[]) {

    CrimeTree tree;
    tree.grabJsonData();
    // tree.printAllSubtrees();
    // tree.bfsAlg();
    tree.dfsAlg();

    // ifstream input("crimeData.json");
    // if (!input) {
    //     std::cerr << "Unable to open file crimeData.json";
    //     return 1;
    // }
    // string line;
    // while(getline(input, line)) {
    //     std::cout << line << std::endl;
    // }
}
