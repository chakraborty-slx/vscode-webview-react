import * as React from "react";
import "./App.css";
import { Table, Space, Button, Input } from "antd";
import { ColumnProps } from "antd/lib/table";
import Highlighter from 'react-highlight-words';
import { SearchOutlined, FunctionOutlined, QuestionCircleOutlined, ExclamationCircleFilled, CheckSquareFilled } from '@ant-design/icons';
import { FilterDropdownProps } from "antd/lib/table/interface";
import * as HintModel from "./model/hintTreeModel";
import FUNCTION from "./svg/function.svg";
import FEASIBLE from "./svg/feasible.svg";
import AHINT from "./svg/ahint.svg";
import PHINT from "./svg/phint.svg";
import HHINT from "./svg/hhint.svg";
import PARTITIONING from "./svg/partition.svg";
import ACCESSPATTERN from "./svg/daphint.svg";
import BRANCHPATTERN from "./svg/lephint.svg";
import HELP from "./svg/help.svg";
import LOOP from "./svg/loop.svg";

interface TableState {
  selectedHint: [],
  searchText: string,
  searchedColumn: string,
}
interface TableProps {
  initialData: HintModel.HintModel;
  vscode: any;
  // data: HintModel.Application[],
  // codeSections: HintModel.CodeSection[]
}
class App extends React.Component<TableProps, TableState> {
  private searchInput: React.RefObject<Input>;

  getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: (props: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={this.searchInput}
          placeholder={`Search ${dataIndex}`}
          value={props.selectedKeys[0]}
          onChange={e =>
            props.setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(props, dataIndex)
          }
          style={{ width: 200, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(props, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.handleReset(props.clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#19f772' : "#ffffff" }} />,
    render: (text: any) =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
          text
        ),
    onFilter: (value: any, record: any) => {

      const recordName = record[dataIndex] || record.data[dataIndex];
      const searchLower = value.toLowerCase();
      return recordName
        .toString()
        .toLowerCase()
        .includes(searchLower)
        ||
        this.getDescendantValues(record, dataIndex).some((descValue: any) => descValue.includes(searchLower));

    },
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => this.searchInput.current!.select());
      }
    },



  })

  getDescendantValues = (record: any, dataIndex: any) => {
    const values = [];
    (function recurse(record) {
      // console.log("recurse", record[dataIndex])
      values.push(record[dataIndex].toString().toLowerCase());
      if (record.children) {
        record.children.forEach(recurse);
      }
    })(record);
    console.log(values)
    return values;
  }

  getColumns = () => {
    const columns: ColumnProps<HintModel.Application>[] = [
      {
        title: "Name",
        dataIndex: "icon",
        width: 300,
        key: "icon",
        ...this.getColumnSearchProps('icon'),
        render: (text, record) => {
          if (record.name) {
            return <div><img src={FUNCTION} height="24" width="24" alt="" /> {record.name}</div>
            // return <div><FunctionOutlined style={{ color: '#19f772' }} /> {record.name}</div>;
          } else {

            let image;
            switch (text) {
              case "APPLICATION":
                image = AHINT;
                break;
              case "PARTITIONING":
                image = PARTITIONING;
                break;
              case "ACCESSPATTERN":
                image = ACCESSPATTERN;
                break;
              case "BRANCHPATTERN":
                image = BRANCHPATTERN;
                break;
              case "LOOP":
                image = LOOP;
                break;
              case "HLS":
                image = HHINT;
                break;
              case "DLP":
              case "PLP":
                image = PHINT;
                break;
            }

            return <div><img src={image} height="24" width="24" alt="" /> {text}</div >;
          }
        }
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          if (text === "FEASIBLE") {
            return <CheckSquareFilled style={{ color: '#19f772' }} />;
          }
        },

      },
      {
        title: "Location",
        dataIndex: "codeSectionsRef",
        key: "codeSectionsRef",
        render: (text, record) => {
          return this.getLocation(text);
        }
      },
      {
        title: "Description",
        dataIndex: "message",
        key: "message",
      },
      {
        title: "Help",
        dataIndex: "helplink",
        key: "helplink",
        render: (text, record) => {
          if (text) {
            return <img src={HELP} height="24" width="24" alt="" />;
            // return <QuestionCircleOutlined style={{ color: '#19f772' }} />;
          }
        }
      }
    ];

    return columns;
  }


  getLocation = (codeRefId: string): string => {
    let location: string = "";

    let cl: HintModel.CodeSection | undefined = this.props.initialData.codeSections.find(e => e.id === codeRefId);
    if (cl) {
      let details: HintModel.CodeSectionDetails | HintModel.CodeSectionDetails[] = cl.codeSection;
      if (Array.isArray(details)) {
        return "Array";
      } else {
        return details.file + " [" + details.beginLine + ":" + details.endLine + "]";

      }
    }
    return location;
  }

  constructor(props: TableProps) {
    super(props);

    // console.log(props.data)
    this.searchInput = React.createRef<Input>();
    this.state = {
      selectedHint: [],
      searchText: '',
      searchedColumn: ''
    }
  }

  clearFilters = () => {
    // this.setState({ filteredInfo: null });
  };


  handleSearch = (props: FilterDropdownProps, dataIndex: any) => {
    props.confirm();
    this.setState({
      searchText: String(props.selectedKeys[0]),
      searchedColumn: dataIndex
    });
  };

  handleReset = (clearFilters: any) => {
    clearFilters();
    this.setState({ searchText: "" });
  };


  handleChange = (pagination: any, filters: any, sorter: any) => {
    //change filter for device name

  };


  onRowKeysChange = (index: any, part: any) => {
    console.log(index, part);
    // this.setState({selectedFPGAPart: part[1] });
  };

  render() {

    return (
      <div className="App" >
        <Table
          size="small"
          dataSource={this.props.initialData.application}
          columns={this.getColumns()}
          rowKey="id"
          defaultExpandAllRows={true}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default App;
