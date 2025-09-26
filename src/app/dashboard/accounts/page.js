"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // 📌 Lấy danh sách accounts
  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/accounts", { cache: "no-store" });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! Status: ${res.status}, Response: ${text}`);
      }

      const data = await res.json();
      const accountsWithStringId = data.map((account) => ({
        ...account,
        _id: account._id?.toString?.() || account._id,
      }));

      setAccounts(accountsWithStringId);
    } catch (e) {
      setAccounts([]);
      setError("Không thể lấy danh sách tài khoản: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 📌 Tạo tài khoản mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! Status: ${res.status}, Response: ${text}`);
      }
      await res.json();
      setIsOpen(false);
      setFormData({ name: "", username: "", password: "" });
      setError("");
      toast.success("Tạo tài khoản thành công!", {
        description: `Tài khoản ${formData.name} đã được tạo.`,
        duration: 3000,
        position: "top-right",
      });
      await fetchAccounts();
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi tạo tài khoản", {
        description: err.message,
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // 📌 Khóa tài khoản
  const handleLockAccount = async (accountId, accountName) => {
    try {
      const res = await fetch("/api/accounts/lock-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, status: 0 }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! Status: ${res.status}, Response: ${text}`);
      }
      await res.json();
      toast.success("Khóa tài khoản thành công!", {
        description: `Tài khoản ${accountName} đã bị khóa.`,
        duration: 3000,
        position: "top-right",
      });
      await fetchAccounts();
    } catch (err) {
      toast.error("Lỗi khi khóa tài khoản", {
        description: err.message,
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // 📌 Mở khóa tài khoản
  const handleUnlockAccount = async (accountId, accountName) => {
    try {
      const res = await fetch("/api/accounts/unlock-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, status: 1 }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! Status: ${res.status}, Response: ${text}`);
      }
      await res.json();
      toast.success("Mở khóa tài khoản thành công!", {
        description: `Tài khoản ${accountName} đã được mở khóa.`,
        duration: 3000,
        position: "top-right",
      });
      await fetchAccounts();
    } catch (err) {
      toast.error("Lỗi khi mở khóa tài khoản", {
        description: err.message,
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Danh Sách Tài Khoản</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Thêm Tài Khoản Mới</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin tài khoản mới tại đây. Nhấn Lưu khi hoàn tất.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Tên
                    </Label>
                    <Input
                      id="name"
                      placeholder="Nhập tên"
                      className="col-span-3"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="Nhập username"
                      className="col-span-3"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Mật khẩu
                    </Label>
                    <Input
                      id="password"
                      placeholder="Nhập mật khẩu"
                      className="col-span-3"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">
              Đang tải danh sách tài khoản...
            </p>
          ) : accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Ngày Tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell>{account.name || "Không rõ"}</TableCell>
                    <TableCell>{account.username || "Không có username"}</TableCell>
                    <TableCell>
                      {account.createdAt
                        ? new Date(account.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {account.status === 0 ? (
                        <span className="text-red-500 font-medium">Đã khóa</span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          Đang hoạt động
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {account.status === 1 ? (
                            <DropdownMenuItem
                              onClick={() =>
                                handleLockAccount(account._id, account.name)
                              }
                            >
                              Khóa
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUnlockAccount(account._id, account.name)
                              }
                            >
                              Mở khóa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">
              Không tìm thấy tài khoản.
            </p>
          )}
          {error && !isLoading && (
            <p className="text-red-500 text-center mt-4">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
