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
import ConfirmDialog from "@/components/confirm-dialog";
import { Plus } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [profiles, setProfiles] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
    position: "Researcher",
    type: "PERSONAL",
    image: null,
  });
  const [accountData, setAccountData] = useState({
    username: "",
    password: "",
  });
  const [avatarData, setAvatarData] = useState({ image: null });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // 📌 Lấy danh sách hồ sơ
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/parties", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProfiles(
        data.map((p) => ({
          ...p,
          _id: p._id?.toString?.() || p._id,
          accountId: p.accountId || null,
          image: p.image || null,
        }))
      );
    } catch (e) {
      setError("Không thể tải danh sách hồ sơ: " + e.message);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // 📌 Xử lý upload hình ảnh (tạo hồ sơ)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Hình ảnh quá lớn", { description: "Vui lòng chọn hình ảnh dưới 5MB" });
        return;
      }
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 📌 Xử lý upload avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Hình ảnh quá lớn", { description: "Vui lòng chọn hình ảnh dưới 5MB" });
        return;
      }
      setAvatarData({ image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 📌 Tạo hồ sơ mới
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("type", formData.type);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const res = await fetch("/api/parties", {
        method: "POST",
        body: formDataToSend,
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Tạo hồ sơ thành công!", { description: `${formData.name} đã được tạo.` });
      setIsCreateOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "EMPLOYEE",
        position: "Researcher",
        type: "PERSONAL",
        image: null,
      });
      setPreviewImage(null);
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi tạo hồ sơ", { description: err.message });
    }
  };

  // 📌 Cập nhật avatar
  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      if (avatarData.image) {
        formDataToSend.append("image", avatarData.image);
      } else {
        throw new Error("Vui lòng chọn hình ảnh");
      }

      const res = await fetch(`/api/parties/${selectedProfile._id}/image`, {
        method: "PATCH",
        body: formDataToSend,
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Cập nhật avatar thành công!", { description: `Avatar của ${selectedProfile.name} đã được cập nhật.` });
      setIsAvatarOpen(false);
      setAvatarData({ image: null });
      setPreviewImage(null);
      setSelectedProfile(null);
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi cập nhật avatar", { description: err.message });
    }
  };

  // 📌 Xóa hồ sơ
  const handleDeleteParty = async (profile) => {
    try {
      // Nếu có tài khoản liên kết, xóa tài khoản trước
      if (profile.accountId) {
        const resDeleteAccount = await fetch(`/api/accounts/${profile.accountId}`, {
          method: "DELETE",
        });
        if (!resDeleteAccount.ok) throw new Error(await resDeleteAccount.text());
      }

      // Xóa party
      const res = await fetch(`/api/parties/${profile._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());

      toast.success("Xóa hồ sơ thành công!", { description: `Hồ sơ của ${profile.name} đã được xóa.` });
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi xóa hồ sơ", { description: err.message });
    }
  };

  // 📌 Mở dialog cấp tài khoản
  const handleOpenAccountDialog = (profile) => {
    setSelectedProfile(profile);
    setAccountData({ username: profile.account?.username || "", password: "" });
    setIsAccountOpen(true);
  };

  // 📌 Mở dialog upload avatar
  const handleOpenAvatarDialog = (profile) => {
    setSelectedProfile(profile);
    setAvatarData({ image: null });
    setPreviewImage(null);
    setIsAvatarOpen(true);
  };

  // 📌 Cấp tài khoản
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId: selectedProfile._id,
          username: accountData.username,
          password: accountData.password,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const createdAccount = await res.json();

      // Cập nhật party.accountId
      await fetch(`/api/parties/${selectedProfile._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: createdAccount.accountId }),
      });

      toast.success("Cấp tài khoản thành công!", { description: `Đã tạo tài khoản cho ${selectedProfile.name}.` });
      setIsAccountOpen(false);
      setSelectedProfile(null);
      setAccountData({ username: "", password: "" });
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi cấp tài khoản", { description: err.message });
    }
  };

  // 📌 Gỡ tài khoản
  const handleRemoveAccount = async (profile) => {
    try {
      if (!profile.accountId) return;

      // Xóa account
      const resDelete = await fetch(`/api/accounts/${profile.accountId}`, {
        method: "DELETE",
      });
      if (!resDelete.ok) throw new Error(await resDelete.text());

      // Xóa accountId trong party
      await fetch(`/api/parties/${profile._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: null }),
      });

      toast.success("Đã gỡ tài khoản thành công!");
      await fetchProfiles();
    } catch (err) {
      toast.error("Lỗi khi gỡ tài khoản", { description: err.message });
    }
  };

  const typeLabel = (type) => (type === "ORGANIZATION" ? "Tổ chức" : "Cá nhân");
  const roleLabel = (role) =>
    role === "EMPLOYEE" ? "Nhân viên" : "Đối tác";
  const positionLabel = (position) =>
    ({
      LaboratoryDirector: "Giám đốc phòng thí nghiệm",
      PrincipalResearcher: "Nhà nghiên cứu chính",
      Researcher: "Nhà nghiên cứu",
      Collaborator: "Cộng tác viên",
      Intern: "Thực tập sinh",
    }[position] || position);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-6xl">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">Danh Sách Hồ Sơ</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Tạo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Tạo Hồ Sơ Mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin hồ sơ tại đây. Nhấn Lưu khi hoàn tất.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProfile}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Tên</Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                      id="email"
                      className="col-span-3"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                    <Input
                      id="phone"
                      className="col-span-3"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">Hình ảnh</Label>
                    <div className="col-span-3">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="col-span-3"
                        onChange={handleImageChange}
                      />
                      {previewImage && (
                        <div className="mt-2">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="object-cover rounded"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Vai trò</Label>
                    <select
                      id="role"
                      className="col-span-3 border rounded px-2 py-1"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="EMPLOYEE">Nhân viên</option>
                      <option value="PARTNER">Đối tác</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">Vị trí</Label>
                    <select
                      id="position"
                      className="col-span-3 border rounded px-2 py-1"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    >
                      <option value="LaboratoryDirector">Giám đốc phòng thí nghiệm</option>
                      <option value="PrincipalResearcher">Nhà nghiên cứu chính</option>
                      <option value="Researcher">Nhà nghiên cứu</option>
                      <option value="Collaborator">Cộng tác viên</option>
                      <option value="Intern">Thực tập sinh</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Loại hồ sơ</Label>
                    <div className="col-span-3 flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          value="PERSONAL"
                          checked={formData.type === "PERSONAL"}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                        Cá nhân
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          value="ORGANIZATION"
                          checked={formData.type === "ORGANIZATION"}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                        Tổ chức
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    setIsCreateOpen(false);
                    setPreviewImage(null);
                  }}>Hủy</Button>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Đang tải danh sách hồ sơ...</p>
          ) : profiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Loại hồ sơ</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Tài khoản</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      {p.image ? (
                        <Image
                          src={`/api/files/${p.image}`}
                          alt={p.name}
                          width={50}
                          height={50}
                          className="object-cover rounded"
                          unoptimized
                        />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-gray-200 rounded flex items-center justify-center">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{p.name || "Không rõ"}</TableCell>
                    <TableCell>{typeLabel(p.type)}</TableCell>
                    <TableCell>{roleLabel(p.role)}</TableCell>
                    <TableCell>{positionLabel(p.position)}</TableCell>
                    <TableCell>{p.email || "—"}</TableCell>
                    <TableCell>{p.phone || "—"}</TableCell>
                    <TableCell>
                      {p.accountId ? (
                        <span className="text-green-600 font-medium">Có thể đăng nhập</span>
                      ) : (
                        <span className="text-red-500 font-medium">Không thể đăng nhập</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">•••</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenAvatarDialog(p)}>
                            Upload Avatar
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <ConfirmDialog
                              trigger={<Button variant="ghost" className="w-full text-left p-0">Xóa hồ sơ</Button>}
                              title="Xác nhận xóa hồ sơ"
                              description={`Bạn có chắc muốn xóa hồ sơ của ${p.name}? Hành động này không thể hoàn tác.`}
                              onConfirm={() => handleDeleteParty(p)}
                            />
                          </DropdownMenuItem>
                          {!p.accountId && (
                            <DropdownMenuItem onClick={() => handleOpenAccountDialog(p)}>
                              Cấp tài khoản
                            </DropdownMenuItem>
                          )}
                          {p.accountId && (
                            <DropdownMenuItem asChild>
                              <ConfirmDialog
                                trigger={<Button variant="ghost" className="w-full text-left p-0">Gỡ tài khoản</Button>}
                                title="Xác nhận gỡ tài khoản"
                                description={`Bạn có chắc muốn gỡ tài khoản của ${p.name}?`}
                                onConfirm={() => handleRemoveAccount(p)}
                              />
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
            <p className="text-center text-muted-foreground">Không có hồ sơ nào.</p>
          )}
          {error && !isLoading && <p className="text-red-500 text-center mt-4">{error}</p>}
        </CardContent>
      </Card>

      {/* Dialog cấp tài khoản */}
      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cấp tài khoản</DialogTitle>
            <DialogDescription>
              Nhập thông tin tài khoản cho <span className="font-semibold">{selectedProfile?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input
                  id="username"
                  className="col-span-3"
                  value={accountData.username}
                  onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3"
                  value={accountData.password}
                  onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAccountOpen(false)}>Hủy</Button>
              <Button type="submit">Tạo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog upload avatar */}
      <Dialog open={isAvatarOpen} onOpenChange={setIsAvatarOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
            <DialogDescription>
              Chọn hình ảnh cho <span className="font-semibold">{selectedProfile?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAvatar}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatar" className="text-right">Hình ảnh</Label>
                <div className="col-span-3">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                    onChange={handleAvatarChange}
                  />
                  {previewImage && (
                    <div className="mt-2">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        width={100}
                        height={100}
                        className="object-cover rounded"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => {
                setIsAvatarOpen(false);
                setPreviewImage(null);
                setAvatarData({ image: null });
              }}>Hủy</Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}