import React from "react";
import { Input, InputGroup, InputGroupText, Button } from "reactstrap";

const CustomerFilterBar = ({
                               searchKeyword,
                               onSearchChange,
                               placeholder = "Tìm kiếm...",
                               selectedStatus,
                               onStatusChange,
                               statusOptions = [],
                               showDropdown = false,
                               onOpenAdvancedFilter,
                               buttonLabel = "Lọc nâng cao",
                           }) => {
    return (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex flex-wrap gap-2">
                {/* Input tìm kiếm */}
                <InputGroup style={{ width: 320 }}>
                    <InputGroupText>
                        <i className="mdi mdi-magnify" />
                    </InputGroupText>
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={searchKeyword}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </InputGroup>

                {/* Dropdown trạng thái nếu có */}
                {showDropdown && (
                    <InputGroup style={{ width: 220 }}>
                        <InputGroupText>
                            <i className="mdi mdi-filter-variant" />
                        </InputGroupText>
                        <Input
                            type="select"
                            value={selectedStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Input>
                    </InputGroup>
                )}
            </div>

            <Button
                color="light"
                className="border"
                style={{ minWidth: 140 }}
                onClick={onOpenAdvancedFilter}
            >
                <i className="mdi mdi-filter-variant me-1"></i> {buttonLabel}
            </Button>
        </div>
    );
};

export default CustomerFilterBar;
